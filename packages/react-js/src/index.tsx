import React from "react";
import { ReplykeProvider as CoreReplykeProvider } from "@replyke/core";
import AccountManager from "./AccountManager";

// Re-export all exports from @replyke/core
export * from "@replyke/core";

// Override ReplykeProvider to inject AccountManager
export const ReplykeProvider: React.FC<{
  projectId: string;
  signedToken?: string | null | undefined;
  children: React.ReactNode;
}> = ({ projectId, signedToken, children }) => {
  return (
    <CoreReplykeProvider projectId={projectId} signedToken={signedToken}>
      <>
        <AccountManager />
        {children}
      </>
    </CoreReplykeProvider>
  );
};
