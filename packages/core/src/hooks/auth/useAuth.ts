import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import type { AppDispatch, RootState } from '../../store';
import { 
  selectAccessToken,
  selectRefreshToken,
  selectLoadingInitial,
  setRefreshToken
} from '../../store/slices/authSlice';
import { 
  signUpWithEmailAndPasswordThunk,
  signInWithEmailAndPasswordThunk,
  signOutThunk,
  changePasswordThunk,
  requestNewAccessTokenThunk
} from '../../store/slices/authThunks';
import useProject from '../projects/useProject';

// Define the interface to match the original useAuth hook
export interface UseAuthValues {
  loadingInitial: boolean;
  accessToken: string | null;
  refreshToken: string | null;
  setRefreshToken: React.Dispatch<React.SetStateAction<string | null>>;
  signUpWithEmailAndPassword: (props: {
    email: string;
    password: string;
    name?: string;
    username?: string;
    avatar?: string;
    bio?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    birthdate?: Date;
    metadata?: Record<string, any>;
    secureMetadata?: Record<string, any>;
  }) => Promise<void>;
  signInWithEmailAndPassword: (props: {
    email: string;
    password: string;
  }) => Promise<void>;
  signOut: () => Promise<void>;
  changePassword: (props: {
    password: string;
    newPassword: string;
  }) => Promise<void>;
  requestNewAccessToken: () => Promise<void>;
}

export default function useAuth(): UseAuthValues {
  const dispatch = useDispatch<AppDispatch>();
  const { projectId } = useProject();
  
  // Selectors
  const loadingInitial = useSelector((state: RootState) => selectLoadingInitial(state));
  const accessToken = useSelector((state: RootState) => selectAccessToken(state));
  const refreshToken = useSelector((state: RootState) => selectRefreshToken(state));

  // Actions
  const handleSignUpWithEmailAndPassword = useCallback(
    async (props: {
      email: string;
      password: string;
      name?: string;
      username?: string;
      avatar?: string;
      bio?: string;
      location?: {
        latitude: number;
        longitude: number;
      };
      birthdate?: Date;
      metadata?: Record<string, any>;
      secureMetadata?: Record<string, any>;
    }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const result = await dispatch(signUpWithEmailAndPasswordThunk({
        projectId,
        ...props,
      }));
      
      if (signUpWithEmailAndPasswordThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, projectId]
  );

  const handleSignInWithEmailAndPassword = useCallback(
    async (props: { email: string; password: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const result = await dispatch(signInWithEmailAndPasswordThunk({
        projectId,
        ...props,
      }));
      
      if (signInWithEmailAndPasswordThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, projectId]
  );

  const handleSignOut = useCallback(async () => {
    if (!projectId) {
      throw new Error("No projectId available.");
    }

    const result = await dispatch(signOutThunk({ projectId }));
    
    if (signOutThunk.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch, projectId]);

  const handleChangePassword = useCallback(
    async (props: { password: string; newPassword: string }) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const result = await dispatch(changePasswordThunk({
        projectId,
        ...props,
      }));
      
      if (changePasswordThunk.rejected.match(result)) {
        throw new Error(result.payload as string);
      }
    },
    [dispatch, projectId]
  );

  const handleRequestNewAccessToken = useCallback(async () => {
    if (!projectId) return;

    const result = await dispatch(requestNewAccessTokenThunk({ projectId }));
    
    if (requestNewAccessTokenThunk.fulfilled.match(result)) {
      return result.payload;
    }
  }, [dispatch, projectId]);

  const handleSetRefreshToken = useCallback((token: React.SetStateAction<string | null>) => {
    // Handle both direct value and function setter patterns
    if (typeof token === 'function') {
      const currentToken = refreshToken;
      const newToken = token(currentToken);
      dispatch(setRefreshToken(newToken));
    } else {
      dispatch(setRefreshToken(token));
    }
  }, [dispatch, refreshToken]);

  return {
    loadingInitial,
    accessToken,
    refreshToken,
    setRefreshToken: handleSetRefreshToken,
    signUpWithEmailAndPassword: handleSignUpWithEmailAndPassword,
    signInWithEmailAndPassword: handleSignInWithEmailAndPassword,
    signOut: handleSignOut,
    changePassword: handleChangePassword,
    requestNewAccessToken: handleRequestNewAccessToken,
  };
}