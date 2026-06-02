import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { SublayState } from "../sublayReducers";

// Types

export interface AccountSummary {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
}

export interface AccountEntry {
  refreshToken: string;
  tokenExpiresAt: number; // epoch ms — extracted from JWT exp claim
  user: AccountSummary;
}

export interface AccountMap {
  activeAccountId: string | null;
  accounts: Record<string, AccountEntry>;
}

export interface AccountsState {
  accounts: Record<string, AccountEntry>;
  activeAccountId: string | null;
  isReady: boolean;
  accountManagerRegistered: boolean;
}

export const MAX_ACCOUNTS = 5;

// Slice

const initialState: AccountsState = {
  accounts: {},
  activeAccountId: null,
  isReady: false,
  accountManagerRegistered: false,
};

const accountsSlice = createSlice({
  name: "accounts",
  initialState,
  reducers: {
    setAccountMap: (state, action: PayloadAction<AccountMap>) => {
      state.accounts = action.payload.accounts;
      state.activeAccountId = action.payload.activeAccountId;
    },
    upsertAccount: (
      state,
      action: PayloadAction<{ userId: string; entry: AccountEntry }>
    ) => {
      const isNewAccount = !(action.payload.userId in state.accounts);
      if (isNewAccount && Object.keys(state.accounts).length >= MAX_ACCOUNTS) {
        // Silently ignore — limit reached. useAddAccount guards this in the UI.
        return;
      }
      state.accounts[action.payload.userId] = action.payload.entry;
    },
    removeAccount: (state, action: PayloadAction<string>) => {
      delete state.accounts[action.payload];
      if (state.activeAccountId === action.payload) {
        const remaining = Object.keys(state.accounts);
        state.activeAccountId = remaining.length > 0 ? remaining[0] : null;
      }
    },
    setActiveAccount: (state, action: PayloadAction<string | null>) => {
      state.activeAccountId = action.payload;
    },
    clearAllAccounts: (state) => {
      state.accounts = {};
      state.activeAccountId = null;
    },
    setAccountsReady: (state, action: PayloadAction<boolean>) => {
      state.isReady = action.payload;
    },
    registerAccountManager: (state) => {
      state.accountManagerRegistered = true;
    },
  },
});

export const {
  setAccountMap,
  upsertAccount,
  removeAccount,
  setActiveAccount,
  clearAllAccounts,
  setAccountsReady,
  registerAccountManager,
} = accountsSlice.actions;

// Selectors — namespaced for dual-mode support
export const selectAccounts = (state: { sublay: SublayState }) =>
  state.sublay.accounts.accounts;
export const selectActiveAccountId = (state: { sublay: SublayState }) =>
  state.sublay.accounts.activeAccountId;
export const selectAccountsReady = (state: { sublay: SublayState }) =>
  state.sublay.accounts.isReady;
export const selectAccountManagerRegistered = (state: { sublay: SublayState }) =>
  state.sublay.accounts.accountManagerRegistered;

export default accountsSlice.reducer;
