import React, { createContext, ReactNode, useContext } from "react";
import useMessageThread, {
  UseMessageThreadValues,
} from "../hooks/chat/messages/useMessageThread";

// ─── Context shape ────────────────────────────────────────────────────────────

export interface MessageThreadContextValue extends UseMessageThreadValues {
  messageId: string;
}

export const MessageThreadContext = createContext<
  Partial<MessageThreadContextValue>
>({});

export function useMessageThreadContext(): Partial<MessageThreadContextValue> {
  return useContext(MessageThreadContext);
}

// ─── Provider ────────────────────────────────────────────────────────────────

export interface MessageThreadProviderProps {
  messageId: string;
  conversationId: string;
  children: ReactNode;
}

export const MessageThreadProvider: React.FC<MessageThreadProviderProps> = ({
  messageId,
  conversationId,
  children,
}) => {
  const data = useMessageThread({ messageId, conversationId });

  return (
    <MessageThreadContext.Provider value={{ ...data, messageId }}>
      {children}
    </MessageThreadContext.Provider>
  );
};
