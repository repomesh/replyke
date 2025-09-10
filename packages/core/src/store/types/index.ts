import type { Action, ThunkAction } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";
import type { store } from "../index";

// Main store type
export type AppStore = typeof store;

// Root state type (re-exported for convenience)
export type { RootState };

// App dispatch type with thunk support
export type AppDispatch = AppStore['dispatch'];

// App thunk type for async actions
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Utility type for typed selectors
export type TypedSelector<T> = (state: RootState) => T;