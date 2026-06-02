import { useCallback, useState } from "react";
import { useSublayDispatch, useSublaySelector } from "../../store/hooks";
import {
  selectAccounts,
  selectActiveAccountId,
  setActiveAccount,
} from "../../store/slices/accountsSlice";
import { setTokens, resetAuth, setInitialized } from "../../store/slices/authSlice";
import { clearUser } from "../../store/slices/userSlice";
import { requestNewAccessTokenThunk } from "../../store/slices/authThunks";
import { baseApi } from "../../store/api/baseApi";
import useProject from "../projects/useProject";

export interface UseSwitchAccountReturn {
  switchAccount: ({ userId }: { userId: string }) => Promise<void>;
  isSwitching: boolean;
  error: string | null;
}

export default function useSwitchAccount(): UseSwitchAccountReturn {
  const dispatch = useSublayDispatch();
  const { projectId } = useProject();
  const accounts = useSublaySelector(selectAccounts);
  const activeAccountId = useSublaySelector(selectActiveAccountId);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchAccount = useCallback(
    async ({ userId }: { userId: string }) => {
      if (!projectId) throw new Error("No projectId available");
      if (userId === activeAccountId) return;
      if (!accounts[userId]) throw new Error(`Account ${userId} not found`);

      setIsSwitching(true);
      setError(null);

      try {
        dispatch(resetAuth());
        dispatch(clearUser());
        dispatch(baseApi.util.resetApiState());
        dispatch(setActiveAccount(userId));
        dispatch(
          setTokens({
            accessToken: null,
            refreshToken: accounts[userId].refreshToken,
          })
        );
        dispatch(setInitialized(false));

        await dispatch(requestNewAccessTokenThunk({ projectId }));

        dispatch(setInitialized(true));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to switch account"
        );
        dispatch(setInitialized(true));
      } finally {
        setIsSwitching(false);
      }
    },
    [dispatch, projectId, accounts, activeAccountId]
  );

  return { switchAccount, isSwitching, error };
}
