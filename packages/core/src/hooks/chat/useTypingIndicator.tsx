import { useCallback, useEffect, useRef } from "react";
import { useReplykeSelector } from "../../store/hooks";
import { selectTypingUsers } from "../../store/slices/chatSlice";
import { useChatContext } from "../../context/chat-context";

export interface UseTypingIndicatorProps {
  conversationId: string;
}

export interface UseTypingIndicatorValues {
  /** userIds of people currently typing (current user is excluded) */
  typingUsers: string[];
  /** Call on each keystroke — internally throttles the keep-alive emit to every 2 s */
  startTyping: () => void;
  /** Call on send, input clear, or blur */
  stopTyping: () => void;
}

/**
 * Manages the typing indicator for a conversation.
 *
 * Sender side protocol (§6.5 of design):
 * 1. On first keystroke after idle: emit `typing:start` immediately.
 * 2. Re-emit `typing:start` every 2 s as a keep-alive while typing continues.
 * 3. On send / blur / input clear: cancel keep-alive, emit `typing:stop`.
 */
function useTypingIndicator({
  conversationId,
}: UseTypingIndicatorProps): UseTypingIndicatorValues {
  const { socket } = useChatContext();

  // Array of other users currently typing (current user already excluded by ChatProvider)
  const typingUsers = useReplykeSelector(selectTypingUsers(conversationId));

  // Whether we (the current user) are currently emitting typing events
  const isTypingRef = useRef(false);
  // Keep-alive interval: re-emits typing:start every 2 s
  const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current !== null) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const startTyping = useCallback(() => {
    if (!socket || !conversationId) return;

    if (!isTypingRef.current) {
      // First keystroke after idle — emit immediately
      isTypingRef.current = true;
      socket.emit("typing:start", { conversationId });

      // Start the 2-second keep-alive
      keepAliveRef.current = setInterval(() => {
        socket.emit("typing:start", { conversationId });
      }, 2000);
    }
    // Subsequent keystrokes while already typing: keep-alive handles re-emitting
  }, [socket, conversationId]);

  const stopTyping = useCallback(() => {
    if (!socket || !conversationId) return;
    if (!isTypingRef.current) return;

    // Cancel keep-alive BEFORE emitting stop to avoid a scheduled keep-alive
    // firing after the stop and briefly re-adding the user to receivers' typing lists
    stopKeepAlive();
    isTypingRef.current = false;
    socket.emit("typing:stop", { conversationId });
  }, [socket, conversationId, stopKeepAlive]);

  // Clean up on unmount or conversation change
  useEffect(() => {
    return () => {
      if (isTypingRef.current && socket && conversationId) {
        stopKeepAlive();
        socket.emit("typing:stop", { conversationId });
        isTypingRef.current = false;
      }
    };
  }, [socket, conversationId, stopKeepAlive]);

  return { typingUsers, startTyping, stopTyping };
}

export default useTypingIndicator;
