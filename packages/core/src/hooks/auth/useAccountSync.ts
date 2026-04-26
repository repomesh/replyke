import { useEffect, useRef } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../store/hooks";
import {
  setAccountMap,
  upsertAccount,
  setActiveAccount,
  setAccountsReady,
  registerAccountManager,
  selectAccounts,
  selectActiveAccountId,
  selectAccountsReady,
  type AccountMap,
  type AccountSummary,
  type AccountEntry,
} from "../../store/slices/accountsSlice";
import { selectRefreshToken, setRefreshToken } from "../../store/slices/authSlice";
import { selectUser } from "../../store/slices/userSlice";
import { handleError } from "../../utils/handleError";
import type { AccountStorage } from "../../interfaces/AccountStorage";

function base64UrlDecode(str: string): string {
  // Convert base64url to standard base64
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof atob === "function") return atob(base64);
  // Fallback for React Native (Buffer available via Node.js polyfill or hermes)
  const GlobalBuffer = (globalThis as any).Buffer;
  if (typeof GlobalBuffer === "function") return GlobalBuffer.from(base64, "base64").toString("utf-8");
  return "";
}

function extractExpFromJwt(jwt: string): number {
  try {
    const payload = JSON.parse(base64UrlDecode(jwt.split(".")[1]));
    return (payload.exp ?? 0) * 1000;
  } catch {
    return 0;
  }
}

export default function useAccountSync(
  storage: AccountStorage,
  projectId: string
): void {
  const dispatch = useReplykeDispatch();
  const refreshToken = useReplykeSelector(selectRefreshToken);
  const user = useReplykeSelector(selectUser); // from userSlice (canonical)
  const accounts = useReplykeSelector(selectAccounts);
  const activeAccountId = useReplykeSelector(selectActiveAccountId);
  const isReady = useReplykeSelector(selectAccountsReady);
  const isInitialLoadRef = useRef(true);

  // Phase A: Mount — register + load from storage
  useEffect(() => {
    dispatch(registerAccountManager());

    const loadAccounts = async () => {
      try {
        const map = await storage.getAccountMap(projectId);
        if (map) {
          // If no active account is set (or it points to a removed account),
          // default to the first available account on load
          const accountIds = Object.keys(map.accounts);
          if (
            accountIds.length > 0 &&
            (!map.activeAccountId || !map.accounts[map.activeAccountId])
          ) {
            map.activeAccountId = accountIds[0];
          }

          dispatch(setAccountMap(map));
          if (map.activeAccountId && map.accounts[map.activeAccountId]) {
            dispatch(
              setRefreshToken(map.accounts[map.activeAccountId].refreshToken)
            );
          }
        }
      } catch (error) {
        handleError(error, "Failed to load account map from storage");
      } finally {
        dispatch(setAccountsReady(true));
      }
    };

    loadAccounts();
  }, []); // projectId is stable for lifetime of ReplykeProvider

  // Phase B: Watch refreshToken + user — upsert account entries
  useEffect(() => {
    if (!isReady || !refreshToken || !user?.id) return;

    const summary: AccountSummary = {
      id: user.id,
      name: user.name ?? null,
      email: user.email ?? null,
      avatar: user.avatar ?? null,
    };

    const entry: AccountEntry = {
      refreshToken,
      tokenExpiresAt: extractExpFromJwt(refreshToken),
      user: summary,
    };

    dispatch(upsertAccount({ userId: user.id, entry }));

    if (user.id !== activeAccountId) {
      dispatch(setActiveAccount(user.id));
    }
  }, [refreshToken, user, isReady]);

  // Phase C: Persist map on changes
  useEffect(() => {
    if (!isReady) return;

    // Skip persisting the initial load (that data came FROM storage)
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }

    const map: AccountMap = { activeAccountId, accounts };
    storage.setAccountMap(projectId, map).catch((error) => {
      handleError(error, "Failed to persist account map");
    });
  }, [accounts, activeAccountId, isReady]);

  // Phase D: Cross-tab sync (web only)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storageKey = `replyke-accounts:${projectId}`;

    const handleStorageEvent = (event: StorageEvent) => {
      if (event.key !== storageKey || !event.newValue) return;
      try {
        const map: AccountMap = JSON.parse(event.newValue);
        dispatch(setAccountMap(map));
        if (map.activeAccountId && map.accounts[map.activeAccountId]) {
          dispatch(
            setRefreshToken(map.accounts[map.activeAccountId].refreshToken)
          );
        }
      } catch (error) {
        handleError(error, "Failed to sync account map from storage event");
      }
    };

    window.addEventListener("storage", handleStorageEvent);
    return () => window.removeEventListener("storage", handleStorageEvent);
  }, [projectId, dispatch]);
}
