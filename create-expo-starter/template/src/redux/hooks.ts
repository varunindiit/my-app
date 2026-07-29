import { useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "./store";

/**
 * Typed Redux hooks — always use these instead of the bare `react-redux` ones.
 *
 * `useDispatch` returns a plain `Dispatch` that does not know about thunks or
 * RTK Query, so `dispatch(someThunk())` fails to typecheck (or worse, silently
 * accepts the wrong thing). `useSelector` without `RootState` forces an inline
 * annotation at every call site.
 */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
export const useAppStore = useStore.withTypes<AppStore>();
