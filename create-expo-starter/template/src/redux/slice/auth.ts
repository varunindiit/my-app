import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Role = "passenger" | "driver";

interface AuthState {
  isLoggedIn: boolean;
  role: Role;
  /** Pending phone number used by the OTP screen */
  pendingPhone?: string;
  verificationPending: boolean;
}

const initialState: AuthState = {
  isLoggedIn: false,
  role: "passenger",
  pendingPhone: undefined,
  verificationPending: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    setRole: (state, action: PayloadAction<Role>) => {
      state.role = action.payload;
    },
    setPendingPhone: (state, action: PayloadAction<string | undefined>) => {
      state.pendingPhone = action.payload;
    },
    setVerificationPending: (state, action: PayloadAction<boolean>) => {
      state.verificationPending = action.payload;
    },
    resetAuthState: () => initialState,
  },
});

export const {
  setIsLoggedIn,
  setRole,
  setPendingPhone,
  setVerificationPending,
  resetAuthState,
} = authSlice.actions;
export default authSlice.reducer;
