import type { Action, ThunkAction } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";
import type { SublayState } from "../sublayReducers";
import type { store } from "../index";

// Main store type
export type AppStore = typeof store;

// Root state type (re-exported for convenience)
// Shape: { sublay: SublayState, sublayApi: {...} }
export type { RootState };

// Sublay feature state type (for selectors)
export type { SublayState };

// App dispatch type with thunk support
export type AppDispatch = AppStore['dispatch'];

// App thunk type for async actions
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Utility type for typed selectors (with namespaced state)
export type TypedSelector<T> = (state: { sublay: SublayState }) => T;