import { combineReducers } from "@reduxjs/toolkit";
import { sublayReducers, SublayState } from "./sublayReducers";
import { baseApi } from "./api/baseApi";

// Root reducer with namespace (used by standalone mode)
// State shape: { sublay: {...}, sublayApi: {...} }
export const rootReducer = combineReducers({
  sublay: sublayReducers,
  [baseApi.reducerPath]: baseApi.reducer, // 'sublayApi'
});

export type RootState = ReturnType<typeof rootReducer>;

// Re-export for convenience
export { SublayState };
