import { combineReducers } from "@reduxjs/toolkit";
import { replykeReducers, ReplykeState } from "./replykeReducers";
import { baseApi } from "./api/baseApi";

// Root reducer with namespace (used by standalone mode)
// State shape: { replyke: {...}, replykeApi: {...} }
export const rootReducer = combineReducers({
  replyke: replykeReducers,
  [baseApi.reducerPath]: baseApi.reducer, // 'replykeApi'
});

export type RootState = ReturnType<typeof rootReducer>;

// Re-export for convenience
export { ReplykeState };
