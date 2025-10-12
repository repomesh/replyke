import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  setProjectContext,
  selectUser,
  selectUserLoading,
  selectUserUpdating,
  selectCurrentProjectId,
  selectUserError,
} from "../../store/slices/userSlice";
import { useUserActions } from "./useUserActions";
import useProject from "../projects/useProject";
import { selectUser as selectAuthUser } from "../../store/slices/authSlice";
import type { AuthUser } from "../../interfaces/models/User";
import type { UpdateUserParams } from "../../store/api/userApi";

export interface UseUserProps {}

export interface UseUserValues {
  user: AuthUser | null;
  loading: boolean;
  updating: boolean;
  error: string | null;

  // Current user management actions
  updateUser: (update: UpdateUserParams) => Promise<AuthUser>;
  
  // Error handling
  clearError: () => void;
}

/**
 * Redux-powered hook that provides comprehensive user management
 * This replaces useUserData and provides the same interface with Redux state management
 */
function useUser(_: UseUserProps = {}): UseUserValues {
  const dispatch = useDispatch<AppDispatch>();

  // Get external context
  const { projectId } = useProject();

  // Get Redux state
  const user = useSelector((state: RootState) => selectUser(state));
  const authUser = useSelector((state: RootState) => selectAuthUser(state)); // Fallback to auth user
  const loading = useSelector((state: RootState) => selectUserLoading(state));
  const updating = useSelector((state: RootState) => selectUserUpdating(state));
  const error = useSelector((state: RootState) => selectUserError(state));
  const currentProjectId = useSelector((state: RootState) => selectCurrentProjectId(state));

  // Get actions
  const {
    setUser,
    updateUser: updateUserAction,
    clearError,
  } = useUserActions();

  // Update Redux state when project changes
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(setProjectContext(projectId));
    }
  }, [dispatch, projectId, currentProjectId]);

  // Sync auth user to user slice when auth user changes and we don't have a user yet
  useEffect(() => {
    if (authUser && !user) {
      setUser(authUser);
    }
  }, [authUser, user, setUser]);

  // Current user operations with projectId included automatically
  const handleUpdateUser = useCallback(
    async (update: UpdateUserParams): Promise<AuthUser> => {
      if (!user) {
        throw new Error("No user available to update");
      }

      if (!projectId) {
        throw new Error("No projectId available");
      }

      // Pass current user for optimistic update reversion if needed
      return await updateUserAction(projectId, user.id, update, user);
    },
    [updateUserAction, user, projectId]
  );

  // Return focused interface for current user management
  return useMemo(
    () => ({
      user: user || authUser, // Fallback to auth user if user slice is empty
      loading,
      updating,
      error,

      updateUser: handleUpdateUser,

      clearError,
    }),
    [
      user,
      authUser,
      loading,
      updating,
      error,
      handleUpdateUser,
      clearError,
    ]
  );
}

export default useUser;