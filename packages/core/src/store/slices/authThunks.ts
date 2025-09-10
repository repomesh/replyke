import { createAsyncThunk } from '@reduxjs/toolkit';
import axios from '../../config/axios';
import { isReactNative } from '../../utils/isReactNative';
import { handleError } from '../../utils/handleError';
import type { AuthUser } from '../../interfaces/models/User';
import type { RootState } from '../index';
import { 
  setTokens, 
  setUser, 
  setLoadingInitial, 
  setAuthenticating, 
  setInitialized,
  resetAuth 
} from './authSlice';

// Auth service functions - calling existing API patterns directly
const authService = {
  async signUpWithEmailAndPassword(
    projectId: string, 
    data: {
      email: string;
      password: string;
      name?: string;
      username?: string;
      avatar?: string;
      bio?: string;
      location?: { latitude: number; longitude: number };
      birthdate?: Date;
      metadata?: Record<string, any>;
      secureMetadata?: Record<string, any>;
    }
  ) {
    const response = await axios.post(
      `/${projectId}/auth/sign-up`,
      {
        email: data.email,
        password: data.password,
        name: data.name?.trim(),
        username: data.username?.trim(),
        avatar: data.avatar,
        bio: data.bio?.trim(),
        location: data.location,
        birthdate: data.birthdate,
        metadata: data.metadata,
        secureMetadata: data.secureMetadata,
      },
      { withCredentials: !isReactNative() }
    );
    
    return response.data;
  },

  async signInWithEmailAndPassword(
    projectId: string,
    data: { email: string; password: string }
  ) {
    const response = await axios.post(
      `/${projectId}/auth/sign-in`,
      data,
      { withCredentials: !isReactNative() }
    );
    
    return response.data;
  },

  async signOut(projectId: string, refreshToken: string | null) {
    await axios.post(
      `/${projectId}/auth/sign-out`,
      { refreshToken },
      { withCredentials: !isReactNative() }
    );
  },

  async requestNewAccessToken(projectId: string, refreshToken: string | null) {
    const response = await axios.post(
      `/${projectId}/auth/request-new-access-token`,
      { refreshToken },
      { withCredentials: !isReactNative() }
    );
    
    return response.data;
  },

  async verifyExternalUser(projectId: string, userJwt: string) {
    const response = await axios.post(
      `/${projectId}/auth/verify-external-user`,
      { userJwt }
    );
    
    return response.data;
  },

  async changePassword(
    projectId: string, 
    data: { password: string; newPassword: string }
  ) {
    await axios.post(
      `/${projectId}/auth/change-password`,
      data,
      { withCredentials: !isReactNative() }
    );
  }
};

// Async Thunks

export const signUpWithEmailAndPasswordThunk = createAsyncThunk(
  'auth/signUpWithEmailAndPassword',
  async (
    data: {
      projectId: string;
      email: string;
      password: string;
      name?: string;
      username?: string;
      avatar?: string;
      bio?: string;
      location?: { latitude: number; longitude: number };
      birthdate?: Date;
      metadata?: Record<string, any>;
      secureMetadata?: Record<string, any>;
    },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setAuthenticating(true));
      
      const result = await authService.signUpWithEmailAndPassword(data.projectId, data);
      
      // Update auth state
      dispatch(setTokens({ 
        accessToken: result.accessToken, 
        refreshToken: result.refreshToken 
      }));
      dispatch(setUser(result.user));
      
      return result;
    } catch (error) {
      handleError(error, "Failed to register user with email and password:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      dispatch(setAuthenticating(false));
    }
  }
);

export const signInWithEmailAndPasswordThunk = createAsyncThunk(
  'auth/signInWithEmailAndPassword',
  async (
    data: { projectId: string; email: string; password: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      dispatch(setAuthenticating(true));
      
      const result = await authService.signInWithEmailAndPassword(data.projectId, data);
      
      // Update auth state
      dispatch(setTokens({ 
        accessToken: result.accessToken, 
        refreshToken: result.refreshToken 
      }));
      dispatch(setUser(result.user));
      
      return result;
    } catch (error) {
      handleError(error, "Failed to log user in:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      dispatch(setAuthenticating(false));
    }
  }
);

export const signOutThunk = createAsyncThunk(
  'auth/signOut',
  async (
    data: { projectId: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    
    // If React Native and no refresh token, throw error (matches original logic)
    if (isReactNative() && !refreshToken) {
      throw new Error("No refresh token");
    }

    try {
      dispatch(setAuthenticating(true));
      
      await authService.signOut(data.projectId, refreshToken);
      
      // Clear auth state
      dispatch(resetAuth());
      
      return;
    } catch (error) {
      handleError(error, "Failed to log user out:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      dispatch(setAuthenticating(false));
    }
  }
);

export const requestNewAccessTokenThunk = createAsyncThunk(
  'auth/requestNewAccessToken',
  async (
    data: { projectId: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    const refreshToken = state.auth.refreshToken;
    
    // If React Native and no refresh token, return early
    if (isReactNative() && !refreshToken) {
      return;
    }

    try {
      const result = await authService.requestNewAccessToken(data.projectId, refreshToken);
      
      // Update auth state
      dispatch(setTokens({ accessToken: result.accessToken }));
      dispatch(setUser(result.user));
      
      return result.accessToken;
    } catch (error) {
      handleError(error, "Request new access token error:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const verifyExternalUserThunk = createAsyncThunk(
  'auth/verifyExternalUser',
  async (
    data: { projectId: string; userJwt: string },
    { dispatch, rejectWithValue }
  ) => {
    try {
      const result = await authService.verifyExternalUser(data.projectId, data.userJwt);
      
      // Update auth state
      dispatch(setTokens({ 
        accessToken: result.accessToken, 
        refreshToken: result.refreshToken 
      }));
      dispatch(setUser(result.user));
      
      return result;
    } catch (error) {
      handleError(error, "Verify external user error:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    }
  }
);

export const changePasswordThunk = createAsyncThunk(
  'auth/changePassword',
  async (
    data: { projectId: string; password: string; newPassword: string },
    { dispatch, getState, rejectWithValue }
  ) => {
    const state = getState() as RootState;
    
    if (!state.auth.user) {
      throw new Error("No user is authenticated");
    }

    try {
      dispatch(setAuthenticating(true));
      
      await authService.changePassword(data.projectId, data);
      
      return;
    } catch (error) {
      handleError(error, "Failed to change password:");
      return rejectWithValue(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      dispatch(setAuthenticating(false));
    }
  }
);

// Initialize auth - handles the startup flow from useAuthData
export const initializeAuthThunk = createAsyncThunk(
  'auth/initialize',
  async (
    data: { projectId: string; signedToken?: string | null },
    { dispatch }
  ) => {
    try {
      dispatch(setLoadingInitial(true));

      // Step 1: If we have a signed token, verify external user
      if (data.signedToken) {
        await dispatch(verifyExternalUserThunk({ 
          projectId: data.projectId, 
          userJwt: data.signedToken 
        }));
      }

      // Step 2: Try to refresh access token (matches original setTimeout logic)
      setTimeout(async () => {
        await dispatch(requestNewAccessTokenThunk({ projectId: data.projectId }));
        dispatch(setLoadingInitial(false));
        dispatch(setInitialized(true));
      }, 0);

    } catch (error) {
      dispatch(setLoadingInitial(false));
      dispatch(setInitialized(true));
      handleError(error, "Auth initialization failed:");
    }
  }
);