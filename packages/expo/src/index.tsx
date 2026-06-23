import React from "react";
import { SublayProvider as OriginalSublayProvider } from "@sublay/core";

// Re-export all exports from @sublay/core
export * from "@sublay/core";
import AccountManager from "./AccountManager";

// Expo-specific OAuth hook (system browser + deep-link return)
export { default as useOAuthSignIn, type UseOAuthSignInReturn } from "./hooks/useOAuthSignIn";

// Expo-specific PushTokenAdapter (expo-notifications)
export { expoPushTokenAdapter } from "./PushTokenAdapter";

// Override SublayProvider
export const SublayProvider: React.FC<{
  projectId: string;
  signedToken?: string | null | undefined;
  children: React.ReactNode;
}> = ({ projectId, signedToken, children }) => {
  return (
    <OriginalSublayProvider projectId={projectId} signedToken={signedToken}>
      <>
        <AccountManager />
        {children}
      </>
    </OriginalSublayProvider>
  );
};
