import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import { apiSlice } from "@/services/apiSlice";
import { setUnauthorizedHandler } from "@/services/api";
import { setMonitoringUser } from "@/services/monitoring";

import { listenerMiddleware } from "./listeners";
import authSlice, { signedOut } from "./slice/auth";
import appSlice from "./slice/app";
import userProfileSlice from "./slice/userProfile";
// #if location
import locationSlice from "./slice/location";
// #endif

// Combined up front (rather than inline in configureStore) so `RootState` is
// derived from the reducer map instead of from the store instance. Deriving it
// from the store makes the store's own generic parameters depend on themselves,
// which TypeScript resolves to `unknown` the moment custom middleware is added.
export const rootReducer = combineReducers({
  auth: authSlice,
  app: appSlice,
  userProfile: userProfileSlice,
  // #if location
  location: locationSlice,
  // #endif
  [apiSlice.reducerPath]: apiSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;

/**
 * Factory so tests can build an isolated store with seeded state instead of
 * mutating the singleton. See src/redux/__tests__/auth.test.ts.
 */
export const makeStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // RTK Query stores AbortSignals / Errors in its internal actions.
          ignoredActions: [`${apiSlice.reducerPath}/executeQuery/rejected`],
        },
      })
        // prepend: listeners must observe an action before reducers commit it.
        .prepend(listenerMiddleware.middleware)
        .concat(apiSlice.middleware),
  });

const store = makeStore();

/**
 * Let the axios client end the session without importing the store
 * (store -> apiSlice -> api -> store would be a cycle). Registering here means
 * a 401 that survives a token refresh drops the user back to the auth flow
 * instead of stranding them on an authenticated screen with no credentials.
 */
setUnauthorizedHandler(() => {
  store.dispatch(signedOut());
  setMonitoringUser(null);
});

/** Enables RTK Query's refetchOnFocus / refetchOnReconnect behaviour. */
setupListeners(store.dispatch);

export type AppStore = ReturnType<typeof makeStore>;
export type AppDispatch = AppStore["dispatch"];

export default store;
