import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { SublayState } from '../sublayReducers';
import type { AuthUser } from '../../interfaces/models/User';

export interface AuthState {
  // Token management
  accessToken: string | null;
  refreshToken: string | null;

  // User data (DEPRECATED - moved to userSlice)
  user: AuthUser | null;

  // Loading states
  isAuthenticating: boolean;

  // Initialization
  initialized: boolean;
  signedToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  isAuthenticating: false,
  initialized: false,
  signedToken: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Token management
    setTokens: (state, action: PayloadAction<{ accessToken: string | null; refreshToken?: string | null }>) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken !== undefined) {
        state.refreshToken = action.payload.refreshToken;
      }
    },
    clearTokens: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
    },
    
    // User management
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },

    // Loading states
    setAuthenticating: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticating = action.payload;
    },
    
    // Initialization
    setInitialized: (state, action: PayloadAction<boolean>) => {
      state.initialized = action.payload;
    },
    setSignedToken: (state, action: PayloadAction<string | null>) => {
      state.signedToken = action.payload;
    },
    
    // Complete auth reset (for signout)
    resetAuth: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.isAuthenticating = false;
      // Keep initialized as it is
    },

    // Individual token setter for compatibility
    setRefreshToken: (state, action: PayloadAction<string | null>) => {
      state.refreshToken = action.payload;
    },
  },
});

export const {
  setTokens,
  clearTokens,
  setUser,
  setAuthenticating,
  setInitialized,
  setSignedToken,
  resetAuth,
  setRefreshToken
} = authSlice.actions;

// Selectors - use namespaced state for dual-mode support
export const selectAccessToken = (state: { sublay: SublayState }) =>
  state.sublay.auth.accessToken;
export const selectRefreshToken = (state: { sublay: SublayState }) =>
  state.sublay.auth.refreshToken;
export const selectUser = (state: { sublay: SublayState }) =>
  state.sublay.auth.user;
export const selectIsAuthenticating = (state: { sublay: SublayState }) =>
  state.sublay.auth.isAuthenticating;
export const selectInitialized = (state: { sublay: SublayState }) =>
  state.sublay.auth.initialized;
export const selectSignedToken = (state: { sublay: SublayState }) =>
  state.sublay.auth.signedToken;

export default authSlice.reducer;