import { combineReducers } from "@reduxjs/toolkit";
import { baseApi } from "./api/baseApi";
import { appNotificationsSlice } from "./slices/appNotificationsSlice";
import authReducer from "./slices/authSlice";
import listsReducer from "./slices/listsSlice";
import { userReducer } from "./slices/userSlice";
import entityListsReducer from "./slices/entityListsSlice";

// Combine all reducers
export const rootReducer = combineReducers({
  // API slice reducer (manages RTK Query cache)
  [baseApi.reducerPath]: baseApi.reducer,

  // Feature slices
  auth: authReducer,
  appNotifications: appNotificationsSlice.reducer,
  lists: listsReducer,
  user: userReducer,
  entityLists: entityListsReducer,

  // Future slices will be added here:
  // entities: entitiesSlice.reducer,
  // comments: commentsSlice.reducer,
});

export type RootState = ReturnType<typeof rootReducer>;