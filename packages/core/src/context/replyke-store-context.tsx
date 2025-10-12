import React, { useEffect } from "react";
import { Provider, useDispatch } from "react-redux";
import { replykeStore } from "../store";
import type { ReactNode } from "react";
import type { AppDispatch } from "../store";
import { initializeAuthThunk } from "../store/slices/authThunks";

export interface ReplykeStoreProviderProps {
  children: ReactNode;
  projectId: string;
  signedToken?: string | null;
}

/**
 * Component that initializes auth state in Redux
 * Must be inside the Redux Provider to dispatch actions
 */
const AuthInitializer: React.FC<{ 
  children: ReactNode; 
  projectId: string; 
  signedToken?: string | null; 
}> = ({ children, projectId, signedToken }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialize auth with project and signed token
    dispatch(initializeAuthThunk({ 
      projectId, 
      signedToken 
    }));
  }, [dispatch, projectId, signedToken]);

  return <>{children}</>;
};

/**
 * Redux store provider for Replyke
 * This component provides the Redux store and initializes auth state
 */
export const ReplykeStoreProvider: React.FC<ReplykeStoreProviderProps> = ({ 
  children,
  projectId,
  signedToken
}) => {
  return (
    <Provider store={replykeStore}>
      <AuthInitializer projectId={projectId} signedToken={signedToken}>
        {children}
      </AuthInitializer>
    </Provider>
  );
};

// Clean Redux-only architecture
// Always integrated with ReplykeProvider

export default ReplykeStoreProvider;