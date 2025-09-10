import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { AuthUser } from '../../interfaces/models/User';

export interface AuthState {
  // Token management
  accessToken: string | null;
  refreshToken: string | null;
  
  // User data
  user: AuthUser | null;
  
  // Loading states
  loadingInitial: boolean;
  isAuthenticating: boolean;
  
  // Initialization
  initialized: boolean;
  signedToken: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  loadingInitial: true,
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
    setLoadingInitial: (state, action: PayloadAction<boolean>) => {
      state.loadingInitial = action.payload;
    },
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
      // Keep loadingInitial and initialized as they are
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
  setLoadingInitial, 
  setAuthenticating, 
  setInitialized, 
  setSignedToken, 
  resetAuth,
  setRefreshToken
} = authSlice.actions;

// Selectors
export const selectAccessToken = (state: RootState) => state.auth.accessToken;
export const selectRefreshToken = (state: RootState) => state.auth.refreshToken;
export const selectUser = (state: RootState) => state.auth.user;
export const selectLoadingInitial = (state: RootState) => state.auth.loadingInitial;
export const selectIsAuthenticating = (state: RootState) => state.auth.isAuthenticating;
export const selectInitialized = (state: RootState) => state.auth.initialized;
export const selectSignedToken = (state: RootState) => state.auth.signedToken;

export default authSlice.reducer;