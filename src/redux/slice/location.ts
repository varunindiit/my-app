import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type LocationStatus =
  | "idle"
  | "loading"
  | "granted"
  | "denied"
  | "error";

export interface ResolvedLocation {
  /** Header-friendly label, e.g. "Yaoundé, Cameroon". */
  label: string;
  /** Full formatted address. */
  address: string;
  latitude: number;
  longitude: number;
}

interface LocationState {
  status: LocationStatus;
  label?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  error?: string;
}

const initialState: LocationState = {
  status: "idle",
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    locationLoading: (state) => {
      state.status = "loading";
      state.error = undefined;
    },
    locationResolved: (state, action: PayloadAction<ResolvedLocation>) => {
      state.status = "granted";
      state.label = action.payload.label;
      state.address = action.payload.address;
      state.latitude = action.payload.latitude;
      state.longitude = action.payload.longitude;
      state.error = undefined;
    },
    locationDenied: (state) => {
      state.status = "denied";
    },
    locationError: (state, action: PayloadAction<string | undefined>) => {
      state.status = "error";
      state.error = action.payload;
    },
    resetLocation: () => initialState,
  },
});

export const {
  locationLoading,
  locationResolved,
  locationDenied,
  locationError,
  resetLocation,
} = locationSlice.actions;

export default locationSlice.reducer;
