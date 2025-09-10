import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { appNotificationsSlice } from "./slices/appNotificationsSlice";
import authReducer from "./slices/authSlice";

// Combine all reducers
export const rootReducer = combineReducers({
  // API slice reducer (manages RTK Query cache)
  [baseApi.reducerPath]: baseApi.reducer,
  
  // Feature slices
  auth: authReducer,
  appNotifications: appNotificationsSlice.reducer,
  
  // Future slices will be added here:
  // entities: entitiesSlice.reducer,
  // lists: listsSlice.reducer,
  // comments: commentsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;