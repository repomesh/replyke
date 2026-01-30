import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { getApiBaseUrl } from "../../utils/env";

// Type for state that includes replyke namespace
// Used by prepareHeaders to access auth token from namespaced state
interface StateWithReplyke {
  replyke: {
    auth: {
      accessToken: string | null;
    };
  };
}

// Base query that uses the current project context and auth
const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: getApiBaseUrl(),
    credentials: 'include', // Equivalent to withCredentials: true
    prepareHeaders: (headers, { getState }) => {
      // Add Content-Type header
      headers.set('Content-Type', 'application/json');

      // Get access token from namespaced Redux state
      const state = getState() as StateWithReplyke;
      const accessToken = state.replyke?.auth?.accessToken;

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
  reducerPath: 'replykeApi',
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
export const replykeApiReducer = baseApi.reducer;
export const replykeApiMiddleware = baseApi.middleware;