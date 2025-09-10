import { useDispatch, useSelector } from 'react-redux';
import { useCallback } from 'react';
import type { AppDispatch, RootState } from '../../store';
import type { AuthUser } from '../../interfaces/models/User';
import { 
  selectUser,
  setUser
} from '../../store/slices/authSlice';

// Define the interface to match the original useUser hook
export interface UseUserReduxValues {
  user: AuthUser | null;
  setUser: (newUser: AuthUser) => void;
}

export default function useUserRedux(): UseUserReduxValues {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors
  const user = useSelector((state: RootState) => selectUser(state));

  // Actions
  const handleSetUser = useCallback((newUser: AuthUser) => {
    dispatch(setUser(newUser));
  }, [dispatch]);

  return {
    user,
    setUser: handleSetUser,
  };
}