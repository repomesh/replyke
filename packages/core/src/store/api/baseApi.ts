import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../../utils/env";

// Type for state that includes sublay namespace
// Used by prepareHeaders to access auth token from namespaced state
interface StateWithSublay {
  sublay: {
    auth: {
      accessToken: string | null;
    };
  };
}

// Base query that uses the current project context and auth
const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    prepareHeaders: (headers, { getState }) => {
      // Add Content-Type header
      headers.set('Content-Type', 'application/json');

      // Get access token from namespaced Redux state
      const state = getState() as StateWithSublay;
      const accessToken = state.sublay?.auth?.accessToken;

      // Add Authorization header if we have a token
      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return headers;
    },
  });
};

// Create the base API slice
export const baseApi = createApi({
  reducerPath: 'sublayApi',
  baseQuery: createBaseQuery(),
  tagTypes: [
    'AppNotification',
    'Collection',
    'CollectionEntities',
    'User',
    'Entity',
    'Space',
    'SpaceMember',
    // Future tag types:
    // 'Comment',
  ],
  endpoints: () => ({}), // Endpoints will be injected by feature APIs
});

// Export hooks for use in components (will be populated by injected endpoints)
export const {} = baseApi;

// Exports for integration mode (users who have their own Redux store)
export const sublayApiReducer = baseApi.reducer;
export const sublayApiMiddleware = baseApi.middleware;