import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '../index';
import type { AuthUser } from '../../interfaces/models/User';

export interface UserState {
  // Current user data
  user: AuthUser | null;
  
  // Loading states
  loading: boolean;
  updating: boolean;
  
  // Current project context
  currentProjectId?: string;
  
  // Error state
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  updating: false,
  currentProjectId: undefined,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // User data management
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.error = null;
    },
    
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    },
    
    // Project context
    setProjectContext: (state, action: PayloadAction<string>) => {
      if (state.currentProjectId !== action.payload) {
        state.currentProjectId = action.payload;
      }
    },
    
    // Loading states
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    
    setUpdating: (state, action: PayloadAction<boolean>) => {
      state.updating = action.payload;
    },
    
    // Error handling
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    // Optimistic updates (will be used by RTK Query)
    updateUserOptimistic: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

// Actions
export const {
  setUser,
  clearUser,
  setProjectContext,
  setLoading,
  setUpdating,
  setError,
  clearError,
  updateUserOptimistic,
} = userSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.user.user;
export const selectUserLoading = (state: RootState) => state.user.loading;
export const selectUserUpdating = (state: RootState) => state.user.updating;
export const selectCurrentProjectId = (state: RootState) => state.user.currentProjectId;
export const selectUserError = (state: RootState) => state.user.error;

// Complex selectors
export const selectUserById = (userId: string) => (state: RootState) => {
  const user = selectUser(state);
  return user?.id === userId ? user : null;
};

// Reducer
export const userReducer = userSlice.reducer;
export default userSlice;