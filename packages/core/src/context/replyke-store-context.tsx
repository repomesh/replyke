import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { replykeStore } from "../store";
import type { ReactNode } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../store/hooks";
import { initializeAuthThunk } from "../store/slices/authThunks";
import {
  selectAccountsReady,
  selectAccountManagerRegistered,
} from "../store/slices/accountsSlice";

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
  const dispatch = useReplykeDispatch();
  const accountsReady = useReplykeSelector(selectAccountsReady);
  const accountManagerRegistered = useReplykeSelector(selectAccountManagerRegistered);
  const [hasWaitedForManager, setHasWaitedForManager] = useState(false);

  // Give AccountManager one microtask to register itself
  useEffect(() => {
    Promise.resolve().then(() => setHasWaitedForManager(true));
  }, []);

  useEffect(() => {
    // Still waiting for the microtask check
    if (!hasWaitedForManager) return;

    // If an AccountManager registered, wait until it signals ready
    if (accountManagerRegistered && !accountsReady) return;

    // Either: no AccountManager (core-only user) OR AccountManager is ready
    dispatch(initializeAuthThunk({ projectId, signedToken }));
  }, [dispatch, projectId, signedToken, hasWaitedForManager, accountManagerRegistered, accountsReady]);

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