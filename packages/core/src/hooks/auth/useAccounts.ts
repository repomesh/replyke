import { useMemo } from "react";
import { useSublaySelector } from "../../store/hooks";
import {
  selectAccounts,
  selectActiveAccountId,
  type AccountSummary,
} from "../../store/slices/accountsSlice";

export interface UseAccountsReturn {
  accounts: AccountSummary[];
  activeAccount: AccountSummary | null;
  accountCount: number;
}

export default function useAccounts(): UseAccountsReturn {
  const accountsMap = useSublaySelector(selectAccounts);
  const activeAccountId = useSublaySelector(selectActiveAccountId);

  return useMemo(() => {
    const accountSummaries = Object.values(accountsMap).map(
      (entry) => entry.user
    );
    const activeAccount = activeAccountId
      ? accountsMap[activeAccountId]?.user ?? null
      : null;

    return {
      accounts: accountSummaries,
      activeAccount,
      accountCount: accountSummaries.length,
    };
  }, [accountsMap, activeAccountId]);
}
