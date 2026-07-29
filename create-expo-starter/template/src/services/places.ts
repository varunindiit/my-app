import axios from "axios";
import api, { toApiError } from "./api";
import Config from "./Config";

/**
 * Place search and geocoding.
 *
 * ── Why this goes through your backend by default ───────────────────────────
 * The Places and Geocoding *web services* authenticate with an API key sent in
 * the request. Google can restrict such a key by IP address, but not by iOS
 * bundle ID or Android signing certificate — those restrictions only apply to
 * the native Maps SDKs. A key shipped inside a mobile bundle is therefore
 * extractable (it is plain text in the JS bundle) and usable by anyone, billed
 * to you, until you notice.
 *
 * So the default path is: app -> your API -> Google, with the key living only
 * on your server. `docs/google-places-proxy.md` has a ~40-line reference
 * implementation and the exact response shapes these functions expect.
 *
 * For local prototyping you can set `EXPO_PUBLIC_PLACES_DIRECT_MODE=true` to
 * call Google straight from the device. Keep a hard quota cap on the key and
 * never ship a build with it enabled — `assertDirectModeIsSafe` throws in
 * production to make that mistake loud rather than expensive.
 */

// ── types ───────────────────────────────────────────────────────────────────

/** A resolved location with everything callers need to render and route. */
export interface LocationValue {
  latitude: number;
  longitude: number;
  address: string;
}

/** A single autocomplete suggestion shown while typing. */
export interface PlaceSuggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
}

/** A reverse-geocoded location enriched with header-friendly labels. */
export interface ReverseGeocodeResult extends LocationValue {
  /** City / locality. */
  city?: string;
  /** Country name. */
  country?: string;
  /** Compact label for headers, e.g. "Lisbon, Portugal". */
  shortLabel: string;
}

export interface AutocompleteOptions {
  signal?: AbortSignal;
  /** Bias results toward a point (usually the device location). */
  bias?: { latitude: number; longitude: number };
  /** Metres. Only meaningful together with `bias`. */
  radius?: number;
}

// ── direct-mode guard ───────────────────────────────────────────────────────

const PLACES_NEW_BASE = "https://places.googleapis.com/v1";
const GEOCODE_BASE = "https://maps.googleapis.com/maps/api/geocode";

const assertDirectModeIsSafe = () => {
  if (Config.isProduction) {
    throw new Error(
      "Places direct mode is enabled in a production build. The Google API key " +
        "is readable in the shipped bundle and billable by anyone. Route these " +
        "calls through your backend instead — see docs/google-places-proxy.md.",
    );
  }
  if (!Config.googleMapsKey) {
    throw new Error(
      "Places direct mode is enabled but EXPO_PUBLIC_GOOGLE_MAPS_API_KEY is empty.",
    );
  }
};

/** Bare client for direct mode — deliberately not the app's `api` instance. */
const google = axios.create({ timeout: 15000 });

// ── autocomplete ────────────────────────────────────────────────────────────

/**
 * Live place suggestions for a search field.
 *
 * Returns `[]` for inputs shorter than two characters rather than firing a
 * billable request per keystroke. Debounce on the caller side too.
 */
export const autocompletePlaces = async (
  input: string,
  options: AutocompleteOptions = {},
): Promise<PlaceSuggestion[]> => {
  const query = input.trim();
  if (query.length < 2) return [];

  const { signal, bias, radius = 50000 } = options;

  try {
    if (!Config.placesDirectMode) {
      const { data } = await api.get<PlaceSuggestion[]>(
        `${Config.placesProxyPath}/autocomplete`,
        {
          signal,
          params: {
            input: query,
            ...(bias ? { lat: bias.latitude, lng: bias.longitude, radius } : {}),
          },
        },
      );
      return Array.isArray(data) ? data : [];
    }

    assertDirectModeIsSafe();

    // Places API (New). The legacy `/place/autocomplete/json` endpoint is not
    // available to Google Cloud projects created after March 2025.
    const { data } = await google.post(
      `${PLACES_NEW_BASE}/places:autocomplete`,
      {
        input: query,
        ...(bias
          ? {
              locationBias: {
                circle: {
                  center: { latitude: bias.latitude, longitude: bias.longitude },
                  radius,
                },
              },
            }
          : {}),
      },
      {
        signal,
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": Config.googleMapsKey,
          "X-Goog-FieldMask":
            "suggestions.placePrediction.placeId," +
            "suggestions.placePrediction.text.text," +
            "suggestions.placePrediction.structuredFormat.mainText.text," +
            "suggestions.placePrediction.structuredFormat.secondaryText.text",
        },
      },
    );

    type Suggestion = {
      placePrediction?: {
        placeId?: string;
        text?: { text?: string };
        structuredFormat?: {
          mainText?: { text?: string };
          secondaryText?: { text?: string };
        };
      };
    };

    return ((data?.suggestions ?? []) as Suggestion[])
      .map((s) => s.placePrediction)
      .filter((p): p is NonNullable<typeof p> => Boolean(p?.placeId))
      .map((p) => ({
        placeId: p.placeId as string,
        primaryText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
        secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
        description: p.text?.text ?? "",
      }));
  } catch (error) {
    throw toApiError(error);
  }
};

// ── place details ───────────────────────────────────────────────────────────

/** Resolve a suggestion (place id) into coordinates + a formatted address. */
export const getPlaceDetails = async (
  placeId: string,
  signal?: AbortSignal,
): Promise<LocationValue> => {
  try {
    if (!Config.placesDirectMode) {
      const { data } = await api.get<LocationValue>(
        `${Config.placesProxyPath}/details`,
        { signal, params: { placeId } },
      );
      return data;
    }

    assertDirectModeIsSafe();

    const { data } = await google.get(
      `${PLACES_NEW_BASE}/places/${encodeURIComponent(placeId)}`,
      {
        signal,
        headers: {
          "X-Goog-Api-Key": Config.googleMapsKey,
          "X-Goog-FieldMask": "location,formattedAddress,displayName",
        },
      },
    );

    return {
      latitude: data?.location?.latitude ?? 0,
      longitude: data?.location?.longitude ?? 0,
      address: data?.formattedAddress ?? data?.displayName?.text ?? "",
    };
  } catch (error) {
    throw toApiError(error);
  }
};

// ── geocoding ───────────────────────────────────────────────────────────────

/** Pull the first matching component (by type) out of a geocode result. */
const pickComponent = (
  components: { types?: string[]; long_name?: string }[] | undefined,
  type: string,
): string | undefined => components?.find((c) => c.types?.includes(type))?.long_name;

/** Forward-geocode a free-text address. Returns null when nothing matches. */
export const geocodeAddress = async (
  address: string,
  signal?: AbortSignal,
): Promise<LocationValue | null> => {
  const query = address.trim();
  if (!query) return null;

  try {
    if (!Config.placesDirectMode) {
      const { data } = await api.get<LocationValue | null>(
        `${Config.placesProxyPath}/geocode`,
        { signal, params: { address: query } },
      );
      return data ?? null;
    }

    assertDirectModeIsSafe();

    const { data } = await google.get(`${GEOCODE_BASE}/json`, {
      signal,
      params: { address: query, key: Config.googleMapsKey, language: "en" },
    });

    if (data?.status !== "OK" || !data.results?.length) return null;

    const best = data.results[0];
    return {
      latitude: best.geometry.location.lat,
      longitude: best.geometry.location.lng,
      address: best.formatted_address ?? query,
    };
  } catch (error) {
    throw toApiError(error);
  }
};

/** Reverse-geocode raw GPS coordinates into a human-readable address. */
export const reverseGeocode = async (
  latitude: number,
  longitude: number,
  signal?: AbortSignal,
): Promise<ReverseGeocodeResult> => {
  const fallback: ReverseGeocodeResult = {
    latitude,
    longitude,
    address: "Current location",
    shortLabel: "Current location",
  };

  try {
    if (!Config.placesDirectMode) {
      const { data } = await api.get<ReverseGeocodeResult>(
        `${Config.placesProxyPath}/reverse-geocode`,
        { signal, params: { lat: latitude, lng: longitude } },
      );
      return data ?? fallback;
    }

    assertDirectModeIsSafe();

    const { data } = await google.get(`${GEOCODE_BASE}/json`, {
      signal,
      params: {
        latlng: `${latitude},${longitude}`,
        key: Config.googleMapsKey,
        language: "en",
      },
    });

    const best =
      data?.status === "OK" && data.results?.length ? data.results[0] : null;
    if (!best) return fallback;

    const components = best.address_components ?? [];
    const city =
      pickComponent(components, "locality") ??
      pickComponent(components, "administrative_area_level_2") ??
      pickComponent(components, "administrative_area_level_1");
    const country = pickComponent(components, "country");
    const address = best.formatted_address ?? fallback.address;

    return {
      latitude,
      longitude,
      address,
      city,
      country,
      shortLabel: city ? (country ? `${city}, ${country}` : city) : address,
    };
  } catch (error) {
    throw toApiError(error);
  }
};
