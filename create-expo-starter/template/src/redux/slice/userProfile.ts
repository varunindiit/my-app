import { createSlice, PayloadAction } from "@reduxjs/toolkit";

/**
 * The signed-in user's profile.
 *
 * Kept deliberately small and generic — add the fields your API actually
 * returns. Once you have a real endpoint, consider moving this to RTK Query
 * (`apiSlice.injectEndpoints`) and keeping only client-owned edits here;
 * server data is easier to manage as cache than as duplicated slice state.
 */
export interface UserProfile {
  id: string | null;
  fullName: string;
  email: string;
  phone: string;
  countryCode: string;
  avatarUri: string | null;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
}

export interface UserProfileState {
  profile: UserProfile;
}

export const emptyProfile: UserProfile = {
  id: null,
  fullName: "",
  email: "",
  phone: "",
  countryCode: "",
  avatarUri: null,
  isEmailVerified: false,
  isPhoneVerified: false,
};

const initialState: UserProfileState = { profile: emptyProfile };

const userProfileSlice = createSlice({
  name: "userProfile",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    setAvatarUri: (state, action: PayloadAction<string | null>) => {
      state.profile.avatarUri = action.payload;
    },
    resetUserProfile: () => initialState,
  },
});

export const { setProfile, setAvatarUri, resetUserProfile } =
  userProfileSlice.actions;
export default userProfileSlice.reducer;
