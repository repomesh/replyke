/**
 * Integration utilities for users who want to use their own Redux store.
 *
 * @example
 * ```typescript
 * import { configureStore } from '@reduxjs/toolkit';
 * import {
 *   sublayReducers,
 *   sublayApiReducer,
 *   sublayMiddleware
 * } from '@sublay/react-js';
 *
 * const store = configureStore({
 *   reducer: {
 *     sublay: sublayReducers,
 *     sublayApi: sublayApiReducer,
 *     ...yourReducers
 *   },
 *   middleware: (getDefault) => getDefault().concat(...sublayMiddleware)
 * });
 * ```
 */

// Feature reducers (combined under 'sublay' key)
export { sublayReducers, type SublayState } from "./sublayReducers";

// RTK Query API reducer and middleware
export {
  baseApi as sublayApi,
  sublayApiReducer,
  sublayApiMiddleware,
} from "./api/baseApi";

// Custom middleware (error handling, logging)
export { customMiddleware as sublayCustomMiddleware } from "./middleware";

// Import for combined middleware array
import { baseApi } from "./api/baseApi";
import { customMiddleware } from "./middleware";

/**
 * Combined middleware array for convenience.
 * Spread this into your middleware chain.
 *
 * @example
 * ```typescript
 * middleware: (getDefault) => getDefault().concat(...sublayMiddleware)
 * ```
 */
export const sublayMiddleware = [
  baseApi.middleware,
  ...customMiddleware,
];
