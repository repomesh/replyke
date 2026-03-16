import { IChatMessage } from "../../../interfaces/models/IChatMessage";
import useChatMessages from "./useChatMessages";
import useSendMessage, { SendMessageParams } from "./useSendMessage";

export interface UseMessageThreadProps {
  conversationId: string;
  messageId: string;
}

export interface UseMessageThreadValues {
  replies: IChatMessage[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  sendReply: (params: Omit<SendMessageParams, "parentMessageId">) => Promise<IChatMessage>;
}

function useMessageThread({
  conversationId,
  messageId,
}: UseMessageThreadProps): UseMessageThreadValues {
  const { messages, loading, hasMore, loadOlder } = useChatMessages({
    conversationId,
    parentId: messageId,
  });

  const { send } = useSendMessage({ conversationId });

  const sendReply = (params: Omit<SendMessageParams, "parentMessageId">) =>
    send({ ...params, parentMessageId: messageId });

  return {
    replies: messages,
    loading,
    hasMore,
    loadMore: loadOlder,
    sendReply,
  };
}

export default useMessageThread;
