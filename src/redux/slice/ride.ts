import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { LocationValue } from "../../services/places";
import { Vehicle } from "./userProfile";

export interface RidePreferences {
  smoking: boolean;
  noSmoking: boolean;
  womenOnly: boolean;
  airConditioning: boolean;
  chargingPort: boolean;
  music: boolean;
  pets: boolean;
}

export interface RideDraft {
  from?: string;
  fromArea?: string;
  /** Resolved pick-up coordinates + full address (from the location search). */
  fromLocation?: LocationValue;
  to?: string;
  toArea?: string;
  /** Resolved drop coordinates + full address (from the location search). */
  toLocation?: LocationValue;
  date?: string;
  time?: string;
  fullPrice?: number;
  vehicle?: Vehicle;
  preferences: RidePreferences;
  luggageSize?: "small" | "medium" | "large";
  musicPreference?: "any" | "no_music" | "low" | "mixed";
  conversationLevel?: "quiet" | "depends" | "talkative";
  pricePerSeat?: number;
  totalSeats?: number;
  duration?: string;
  distance?: string;
}

interface RideState {
  draft: RideDraft;
  publishing: boolean;
}

const initialState: RideState = {
  draft: {
    from: "Yaoundé, Central Post",
    fromLocation: {
      latitude: 3.8667,
      longitude: 11.5167,
      address: "Yaoundé, Central Post",
    },
    preferences: {
      smoking: false,
      noSmoking: true,
      womenOnly: false,
      airConditioning: true,
      chargingPort: true,
      music: true,
      pets: false,
    },
    totalSeats: 3,
  },
  publishing: false,
};

const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    updateDraft: (state, action: PayloadAction<Partial<RideDraft>>) => {
      state.draft = { ...state.draft, ...action.payload };
    },
    updatePreferences: (
      state,
      action: PayloadAction<Partial<RidePreferences>>,
    ) => {
      state.draft.preferences = {
        ...state.draft.preferences,
        ...action.payload,
      };
    },
    setPublishing: (state, action: PayloadAction<boolean>) => {
      state.publishing = action.payload;
    },
    resetDraft: () => initialState,
  },
});

export const { updateDraft, updatePreferences, setPublishing, resetDraft } =
  rideSlice.actions;
export default rideSlice.reducer;
