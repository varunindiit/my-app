import { useCallback, useEffect, useRef } from "react";
import * as Location from "expo-location";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
  locationDenied,
  locationError,
  locationLoading,
  locationResolved,
} from "@/redux/slice/location";
import { reverseGeocode } from "@/services/places";

/**
 * Reusable device-location hook.
 *
 * Requests permission via `expo-location`, fetches the current coordinates,
 * reverse-geocodes them into a readable label and stores everything in the
 * `location` slice so any screen can read it without re-prompting.
 *
 * The fetch runs automatically once per app session (while the slice is still
 * `idle`); call `refetch()` to retry after a denial or error.
 */
export const useCurrentLocation = (auto = true) => {
  const dispatch = useAppDispatch();
  const location = useAppSelector((s) => s.location);
  const abortRef = useRef<AbortController | null>(null);

  const fetchLocation = useCallback(async () => {
    // Supersede any in-flight geocode so a fast refetch can't resolve with a
    // stale answer after the newer one lands.
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    dispatch(locationLoading());
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        dispatch(locationDenied());
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const result = await reverseGeocode(
        position.coords.latitude,
        position.coords.longitude,
        controller.signal,
      );

      if (controller.signal.aborted) return;

      dispatch(
        locationResolved({
          label: result.shortLabel,
          address: result.address,
          latitude: result.latitude,
          longitude: result.longitude,
        }),
      );
    } catch (error) {
      if (controller.signal.aborted) return;
      const message = error instanceof Error ? error.message : "";
      dispatch(
        locationError(
          /location services/i.test(message)
            ? "Location services are off"
            : "Couldn't get your location",
        ),
      );
    }
  }, [dispatch]);

  const status = location.status;

  useEffect(() => {
    if (auto && status === "idle") {
      fetchLocation();
    }
  }, [auto, status, fetchLocation]);

  // Abort any pending geocode when the last consumer unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  return { ...location, refetch: fetchLocation };
};

export default useCurrentLocation;
