import { describe, it, expect, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { SublayStoreProvider } from "./sublay-store-context";
import { sublayStore } from "../store";
import { useSublaySelector } from "../store/hooks";
import { selectInitialized, setInitialized, resetAuth } from "../store/slices/authSlice";
import {
  registerAccountManager,
  setAccountsReady,
  clearAllAccounts,
} from "../store/slices/accountsSlice";

// SublayStoreProvider mounts the real `sublayStore` singleton (not a
// per-test store), so leftover state from one test is visible to the next —
// reset every slice this component touches.
afterEach(() => {
  act(() => {
    sublayStore.dispatch(resetAuth());
    sublayStore.dispatch(setInitialized(false));
    sublayStore.dispatch(clearAllAccounts());
    sublayStore.dispatch(setAccountsReady(false));
  });
});

describe("SublayStoreProvider", () => {
  it("initializes auth immediately when no AccountManager registers", async () => {
    const { result } = renderHook(() => useSublaySelector(selectInitialized), {
      wrapper: ({ children }) => (
        <SublayStoreProvider projectId="test-project">{children}</SublayStoreProvider>
      ),
    });

    await waitFor(() => expect(result.current).toBe(true));
  });

  it("waits for the AccountManager to report ready before initializing auth", async () => {
    act(() => {
      sublayStore.dispatch(registerAccountManager());
    });

    const { result } = renderHook(() => useSublaySelector(selectInitialized), {
      wrapper: ({ children }) => (
        <SublayStoreProvider projectId="test-project">{children}</SublayStoreProvider>
      ),
    });

    // Flush the provider's one-microtask wait for AccountManager
    // registration. Auth must still be blocked: a manager registered, but it
    // hasn't signaled `accountsReady` yet.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(result.current).toBe(false);

    act(() => {
      sublayStore.dispatch(setAccountsReady(true));
    });

    await waitFor(() => expect(result.current).toBe(true));
  });
});
