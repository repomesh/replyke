import type { Action, ThunkAction } from "@reduxjs/toolkit";
import type { RootState } from "../rootReducer";
import type { ReplykeState } from "../replykeReducers";
import type { store } from "../index";

// Main store type
export type AppStore = typeof store;

// Root state type (re-exported for convenience)
// Shape: { replyke: ReplykeState, replykeApi: {...} }
export type { RootState };

// Replyke feature state type (for selectors)
export type { ReplykeState };

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
export type TypedSelector<T> = (state: { replyke: ReplykeState }) => T;