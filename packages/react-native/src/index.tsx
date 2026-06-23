import React from "react";
import { SublayProvider as OriginalSublayProvider } from "@sublay/core";

// Re-export all exports from @sublay/core
export * from "@sublay/core";
import AccountManager from "./AccountManager";

// React Native-specific PushTokenAdapter (@react-native-firebase/messaging)
export { reactNativePushTokenAdapter } from "./PushTokenAdapter";

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
