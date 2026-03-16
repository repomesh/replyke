import useChatMessages from "./messages/useChatMessages";
import useSendMessage from "./messages/useSendMessage";
import { SendMessageParams } from "./messages/useSendMessage";
import useConversationMembers, {
  UseConversationMembersValues,
} from "./conversations/useConversationMembers";
import useMarkConversationAsRead from "./useMarkConversationAsRead";
import { IChatMessage } from "../../interfaces/models/IChatMessage";

export interface UseConversationDataProps {
  conversationId: string;
}

export interface UseConversationDataValues {
  // Messages
  messages: IChatMessage[];
  messagesLoading: boolean;
  hasMore: boolean;
  loadOlder: () => Promise<void>;

  // Send
  send: (params: SendMessageParams) => Promise<IChatMessage>;

  // Members
  members: UseConversationMembersValues["members"];
  membersLoading: UseConversationMembersValues["loading"];
  addMember: UseConversationMembersValues["addMember"];
  removeMember: UseConversationMembersValues["removeMember"];
  leave: UseConversationMembersValues["leave"];
  changeRole: UseConversationMembersValues["changeRole"];

  // Read state
  mark: (messageId: string) => Promise<void>;
}

/**
 * High-level composition hook that powers ConversationProvider.
 * Combines messages, send, members, and read-state into a single object.
 * Typing indicator is a stub here — real-time wiring is added in Phase 6.
 */
function useConversationData({
  conversationId,
}: UseConversationDataProps): UseConversationDataValues {
  const { messages, loading: messagesLoading, hasMore, loadOlder } = useChatMessages({
    conversationId,
  });

  const send = useSendMessage({ conversationId });

  const {
    members,
    loading: membersLoading,
    addMember,
    removeMember,
    leave,
    changeRole,
  } = useConversationMembers({ conversationId });

  const mark = useMarkConversationAsRead({ conversationId });

  return {
    messages,
    messagesLoading,
    hasMore,
    loadOlder,
    send,
    members,
    membersLoading,
    addMember,
    removeMember,
    leave,
    changeRole,
    mark,
  };
}

export default useConversationData;
