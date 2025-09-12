import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../index";

// Base query that uses the current project context and auth
const createBaseQuery = () => {
  return fetchBaseQuery({
    baseUrl: process.env.REACT_APP_API_BASE_URL || 'https://api.replyke.com/api/v5',
    credentials: 'include', // Equivalent to withCredentials: true
    prepareHeaders: (headers, { getState }) => {
      // Add Content-Type header
      headers.set('Content-Type', 'application/json');
      
      // Get access token from Redux state
      const state = getState() as RootState;
      const accessToken = state.auth.accessToken;
      
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
  reducerPath: 'api',
  baseQuery: createBaseQuery(),
  tagTypes: [
    'AppNotification',
    'List',
    'User',
    // Future tag types:
    // 'Entity',
    // 'Comment', 
  ],
  endpoints: () => ({}), // Endpoints will be injected by feature APIs
});

// Export hooks for use in components (will be populated by injected endpoints)
export const {} = baseApi;