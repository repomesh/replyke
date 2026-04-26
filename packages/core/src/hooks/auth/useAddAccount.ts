import { useCallback } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../store/hooks";
import { resetAuth } from "../../store/slices/authSlice";
import { clearUser } from "../../store/slices/userSlice";
import {
  setActiveAccount,
  selectAccounts,
  MAX_ACCOUNTS,
} from "../../store/slices/accountsSlice";
import { baseApi } from "../../store/api/baseApi";

export interface UseAddAccountReturn {
  addAccount: () => void;
  canAddAccount: boolean;
}

export default function useAddAccount(): UseAddAccountReturn {
  const dispatch = useReplykeDispatch();
  const accounts = useReplykeSelector(selectAccounts);
  const canAddAccount = Object.keys(accounts).length < MAX_ACCOUNTS;

  const addAccount = useCallback(() => {
    if (!canAddAccount) return;

    // Clear active auth state so the sign-in UI appears.
    // Existing accounts remain safely in the accounts map.
    // After the user signs in, useAccountSync auto-upserts the new account.
    dispatch(resetAuth());
    dispatch(clearUser());
    dispatch(setActiveAccount(null));
    dispatch(baseApi.util.resetApiState());
  }, [dispatch, canAddAccount]);

  return { addAccount, canAddAccount };
}
