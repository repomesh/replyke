import { Middleware } from "@reduxjs/toolkit";
import { handleError } from "../utils/handleError";
import { isDevelopment } from "../utils/env";

// Error handling middleware for Redux actions
export const errorMiddleware: Middleware = (store) => (next) => (action: any) => {
  try {
    return next(action);
  } catch (error) {
    handleError(error, `Redux action failed: ${action.type}`);
    throw error;
  }
};

// Selective logger middleware for development - only logs important actions
export const loggerMiddleware: Middleware = (store) => (next) => (action: any) => {
  const result = next(action);
  
  // Only log failed API calls and errors in development
  if (isDevelopment() && action.type.includes('/rejected')) {
    console.group(`❌ Redux Action Failed: ${action.type}`);
    console.log('Error:', action.payload);
    console.log('Action:', action);
    console.groupEnd();
  }
  
  return result;
};

// Combine all custom middleware
export const customMiddleware = [
  errorMiddleware,
  ...(isDevelopment() ? [loggerMiddleware] : [])
];