import React from "react";
import { SublayProvider as CoreSublayProvider } from "@sublay/core";
import AccountManager from "./AccountManager";

// Re-export all exports from @sublay/core
export * from "@sublay/core";

// Web-only OAuth hook (uses window.location for redirect-based flow)
export { default as useOAuthSignIn, type UseOAuthSignInReturn } from "./hooks/useOAuthSignIn";

// Override SublayProvider to inject AccountManager
export const SublayProvider: React.FC<{
  projectId: string;
  signedToken?: string | null | undefined;
  children: React.ReactNode;
}> = ({ projectId, signedToken, children }) => {
  return (
    <CoreSublayProvider projectId={projectId} signedToken={signedToken}>
      <>
        <AccountManager />
        {children}
      </>
    </CoreSublayProvider>
  );
};
