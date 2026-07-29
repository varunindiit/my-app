# Proxying Google Places & geocoding

`src/services/places.ts` calls **your** backend by default, not Google. This
page explains why, and gives you the ~60 lines of server code that make it work.

## Why not call Google from the app?

Google API keys can be restricted two ways:

| Restriction | Works for | Doesn't work for |
| --- | --- | --- |
| iOS bundle ID / Android SHA-1 | Maps **SDKs** (the native map view) | Web-service endpoints |
| IP address | Server-to-server calls | Mobile clients (every user has a different IP) |

The Places, Geocoding and Directions **web services** are the second row. There
is no restriction that says "only my app may use this key", so a key shipped in
a mobile bundle is:

1. **Extractable.** `EXPO_PUBLIC_*` values are inlined into the JS bundle as
   plain strings. `unzip app.apk && strings` finds them in seconds.
2. **Billable.** Places Autocomplete is priced per session, Geocoding per
   request. A scraped key can run up a five-figure bill against your project
   before the quota alert email arrives.

Routing through your own server keeps the key server-side, lets you cache
responses (Google's terms permit caching place IDs), and gives you one place to
add rate limiting per user.

## Endpoints the app expects

The app calls `${EXPO_PUBLIC_API_URL}${EXPO_PUBLIC_PLACES_PROXY_PATH}/…`
(default `/places`) and expects these shapes:

| Route | Query | Response |
| --- | --- | --- |
| `GET /places/autocomplete` | `input`, optional `lat`, `lng`, `radius` | `PlaceSuggestion[]` |
| `GET /places/details` | `placeId` | `LocationValue` |
| `GET /places/geocode` | `address` | `LocationValue \| null` |
| `GET /places/reverse-geocode` | `lat`, `lng` | `ReverseGeocodeResult` |

```ts
type LocationValue = { latitude: number; longitude: number; address: string };

type PlaceSuggestion = {
  placeId: string;
  primaryText: string;
  secondaryText: string;
  description: string;
};

type ReverseGeocodeResult = LocationValue & {
  city?: string;
  country?: string;
  shortLabel: string; // "Lisbon, Portugal"
};
```

## Reference implementation (Express)

Uses **Places API (New)**. The legacy `/maps/api/place/*` endpoints are not
available to Google Cloud projects created after March 2025, so new projects
must use these.

```js
import express from "express";

const router = express.Router();
const KEY = process.env.GOOGLE_MAPS_API_KEY; // server-side only
const PLACES = "https://places.googleapis.com/v1";
const GEOCODE = "https://maps.googleapis.com/maps/api/geocode/json";

router.get("/autocomplete", async (req, res, next) => {
  try {
    const { input, lat, lng, radius = 50000 } = req.query;
    if (!input || String(input).trim().length < 2) return res.json([]);

    const body = { input: String(input) };
    if (lat && lng) {
      body.locationBias = {
        circle: {
          center: { latitude: Number(lat), longitude: Number(lng) },
          radius: Number(radius),
        },
      };
    }

    const response = await fetch(`${PLACES}/places:autocomplete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": KEY,
        "X-Goog-FieldMask": [
          "suggestions.placePrediction.placeId",
          "suggestions.placePrediction.text.text",
          "suggestions.placePrediction.structuredFormat.mainText.text",
          "suggestions.placePrediction.structuredFormat.secondaryText.text",
        ].join(","),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    res.json(
      (data.suggestions ?? [])
        .map((s) => s.placePrediction)
        .filter((p) => p?.placeId)
        .map((p) => ({
          placeId: p.placeId,
          primaryText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? "",
          secondaryText: p.structuredFormat?.secondaryText?.text ?? "",
          description: p.text?.text ?? "",
        })),
    );
  } catch (error) {
    next(error);
  }
});

router.get("/details", async (req, res, next) => {
  try {
    const response = await fetch(
      `${PLACES}/places/${encodeURIComponent(String(req.query.placeId))}`,
      {
        headers: {
          "X-Goog-Api-Key": KEY,
          "X-Goog-FieldMask": "location,formattedAddress,displayName",
        },
      },
    );
    const data = await response.json();
    res.json({
      latitude: data.location?.latitude ?? 0,
      longitude: data.location?.longitude ?? 0,
      address: data.formattedAddress ?? data.displayName?.text ?? "",
    });
  } catch (error) {
    next(error);
  }
});

const geocode = async (params) => {
  const url = new URL(GEOCODE);
  Object.entries({ ...params, key: KEY, language: "en" }).forEach(([k, v]) =>
    url.searchParams.set(k, String(v)),
  );
  const response = await fetch(url);
  return response.json();
};

router.get("/geocode", async (req, res, next) => {
  try {
    const data = await geocode({ address: String(req.query.address ?? "") });
    if (data.status !== "OK" || !data.results?.length) return res.json(null);
    const best = data.results[0];
    res.json({
      latitude: best.geometry.location.lat,
      longitude: best.geometry.location.lng,
      address: best.formatted_address,
    });
  } catch (error) {
    next(error);
  }
});

router.get("/reverse-geocode", async (req, res, next) => {
  try {
    const { lat, lng } = req.query;
    const data = await geocode({ latlng: `${lat},${lng}` });
    const best = data.status === "OK" ? data.results?.[0] : null;

    const pick = (type) =>
      best?.address_components?.find((c) => c.types?.includes(type))?.long_name;

    const city =
      pick("locality") ??
      pick("administrative_area_level_2") ??
      pick("administrative_area_level_1");
    const country = pick("country");
    const address = best?.formatted_address ?? "Current location";

    res.json({
      latitude: Number(lat),
      longitude: Number(lng),
      address,
      city,
      country,
      shortLabel: city ? (country ? `${city}, ${country}` : city) : address,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
```

Mount it at the path the app expects:

```js
app.use("/places", requireAuth, rateLimit, placesRouter);
```

## Hardening checklist

- **Require authentication.** An open proxy is the same billing problem with an
  extra hop.
- **Rate limit per user**, not per IP — mobile carriers NAT many users behind
  one address.
- **Cap the key's quota** in Google Cloud regardless, as a backstop.
- **Restrict the key by IP** to your server's egress addresses. This is the
  restriction that finally works once the key is server-side.
- **Cache** autocomplete responses briefly and place details for longer; Google
  permits caching place IDs indefinitely.

## Prototyping without a backend

Set `EXPO_PUBLIC_PLACES_DIRECT_MODE=true` and provide
`EXPO_PUBLIC_GOOGLE_MAPS_API_KEY`. The app then calls Google directly.

`assertDirectModeIsSafe()` in `src/services/places.ts` throws if direct mode is
still enabled when `APP_ENV=production`, so this cannot reach a release build by
accident.
