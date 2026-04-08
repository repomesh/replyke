import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";

export interface DeleteConversationProps {
  conversationId: string;
}

function useDeleteConversation(): (
  props: DeleteConversationProps
) => Promise<void> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const deleteConversation = useCallback(
    async ({ conversationId }: DeleteConversationProps): Promise<void> => {
      if (!projectId) throw new Error("No projectId available.");
      if (!conversationId) throw new Error("Please pass a conversationId.");

      await axios.delete(
        `/${projectId}/chat/conversations/${conversationId}`
      );
    },
    [projectId, axios]
  );

  return deleteConversation;
}

export default useDeleteConversation;
