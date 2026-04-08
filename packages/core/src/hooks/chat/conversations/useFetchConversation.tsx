import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { Conversation } from "../../../interfaces/models/Conversation";

export interface FetchConversationProps {
  conversationId: string;
}

function useFetchConversation(): (
  props: FetchConversationProps
) => Promise<Conversation> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchConversation = useCallback(
    async ({ conversationId }: FetchConversationProps): Promise<Conversation> => {
      if (!projectId) throw new Error("No projectId available.");
      if (!conversationId) throw new Error("Please pass a conversationId.");

      const response = await axios.get(
        `/${projectId}/chat/conversations/${conversationId}`
      );
      return response.data as Conversation;
    },
    [projectId, axios]
  );

  return fetchConversation;
}

export default useFetchConversation;
