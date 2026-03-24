import { useChatContext } from "../../context/chat-context";
import type { ChatContextValue } from "../../context/chat-context";

export interface UseChatSocketValues {
  socket: ChatContextValue["socket"];
  connected: boolean;
}

/**
 * Access the shared Socket.io socket instance and its connection state.
 * Must be used inside a ChatProvider.
 */
function useChatSocket(): UseChatSocketValues {
  const { socket, connected } = useChatContext();
  return { socket, connected };
}

export default useChatSocket;
