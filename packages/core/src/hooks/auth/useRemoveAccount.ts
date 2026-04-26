import { useCallback, useState } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../store/hooks";
import {
  selectAccounts,
  selectActiveAccountId,
  removeAccount as removeAccountAction,
} from "../../store/slices/accountsSlice";
import { resetAuth, setTokens, setInitialized } from "../../store/slices/authSlice";
import { clearUser } from "../../store/slices/userSlice";
import { requestNewAccessTokenThunk } from "../../store/slices/authThunks";
import { baseApi } from "../../store/api/baseApi";
import useProject from "../projects/useProject";
import axios from "../../config/axios";
import { handleError } from "../../utils/handleError";

export interface UseRemoveAccountReturn {
  removeAccount: ({ userId }: { userId: string }) => Promise<void>;
  isRemoving: boolean;
  error: string | null;
}

export default function useRemoveAccount(): UseRemoveAccountReturn {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const accounts = useReplykeSelector(selectAccounts);
  const activeAccountId = useReplykeSelector(selectActiveAccountId);
  const [isRemoving, setIsRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeAccount = useCallback(
    async ({ userId }: { userId: string }) => {
      if (!projectId) throw new Error("No projectId available");
      const targetAccount = accounts[userId];
      if (!targetAccount) throw new Error(`Account ${userId} not found`);

      setIsRemoving(true);
      setError(null);

      const isActiveAccount = userId === activeAccountId;

      try {
        // Best-effort server sign-out
        try {
          await axios.post(
            `/${projectId}/auth/sign-out`,
            { refreshToken: targetAccount.refreshToken }
          );
        } catch (signOutError) {
          handleError(signOutError, "Server sign-out failed during account removal");
        }

        // Remove from accounts map
        dispatch(removeAccountAction(userId));

        if (isActiveAccount) {
          const remainingIds = Object.keys(accounts).filter(
            (id) => id !== userId
          );

          if (remainingIds.length > 0) {
            const nextId = remainingIds[0];
            const nextAccount = accounts[nextId];

            dispatch(resetAuth());
            dispatch(clearUser());
            dispatch(baseApi.util.resetApiState());
            dispatch(
              setTokens({
                accessToken: null,
                refreshToken: nextAccount.refreshToken,
              })
            );
            dispatch(setInitialized(false));
            await dispatch(requestNewAccessTokenThunk({ projectId }));
            dispatch(setInitialized(true));
          } else {
            dispatch(resetAuth());
            dispatch(clearUser());
            dispatch(baseApi.util.resetApiState());
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to remove account"
        );
      } finally {
        setIsRemoving(false);
      }
    },
    [dispatch, projectId, accounts, activeAccountId]
  );

  return { removeAccount, isRemoving, error };
}
