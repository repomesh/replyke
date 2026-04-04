import type { AccountMap } from "../store/slices/accountsSlice";

export interface AccountStorage {
  getAccountMap(projectId: string): Promise<AccountMap | null>;
  setAccountMap(projectId: string, map: AccountMap): Promise<void>;
  deleteAccountMap(projectId: string): Promise<void>;
}
