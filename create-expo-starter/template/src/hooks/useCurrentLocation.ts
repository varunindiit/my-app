import { useCallback, useEffect } from "react";
import * as Location from "expo-location";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import {
  locationDenied,
  locationError,
  locationLoading,
  locationResolved,
} from "../redux/slice/location";
import { reverseGeocode } from "../services/places";

/**
 * Reusable device-location hook (Expo).
 *
 * Requests location permission via `expo-location`, fetches the current
 * coordinates, reverse-geocodes them into a readable city label and stores
 * everything in the global `location` slice so any screen (Passenger or Driver
 * home) can render it.
 *
 * The fetch runs automatically once per app session (when the slice is still
 * `idle`); call `refetch()` to retry after a denial or error.
 */
export const useCurrentLocation = (auto = true) => {
  const dispatch = useDispatch();
  const location = useSelector((s: RootState) => s.location);

  const fetchLocation = useCallback(async () => {
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
      );
      dispatch(
        locationResolved({
          label: result.shortLabel,
          address: result.address,
          latitude: result.latitude,
          longitude: result.longitude,
        }),
      );
    } catch (err: any) {
      const servicesOff = /location services/i.test(err?.message ?? "");
      dispatch(
        locationError(
          servicesOff
            ? "Location services are off"
            : "Couldn't get your location",
        ),
      );
    }
  }, [dispatch]);

  // Fire once per session while the slice is still idle.
  useEffect(() => {
    if (auto && location.status === "idle") {
      fetchLocation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ...location, refetch: fetchLocation };
};

export default useCurrentLocation;
