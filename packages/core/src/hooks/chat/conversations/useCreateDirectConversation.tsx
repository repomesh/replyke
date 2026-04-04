import { useCallback } from "react";
import { useReplykeDispatch } from "../../../store/hooks";
import { setConversation } from "../../../store/slices/chatSlice";
import { Conversation } from "../../../interfaces/models/Conversation";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface CreateDirectConversationProps {
  userId: string;
}

function useCreateDirectConversation(): (
  props: CreateDirectConversationProps
) => Promise<Conversation> {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const create = useCallback(
    async ({ userId }: CreateDirectConversationProps): Promise<Conversation> => {
      if (!projectId) throw new Error("No projectId available.");
      if (!userId) throw new Error("Please pass a userId.");

      try {
        const response = await axios.post(
          `/${projectId}/chat/conversations/direct`,
          { userId }
        );
        const conversation = response.data as Conversation;
        dispatch(setConversation(conversation));
        return conversation;
      } catch (err) {
        handleError(err, "Failed to create direct conversation");
        throw err;
      }
    },
    [projectId, axios, dispatch]
  );

  return create;
}

export default useCreateDirectConversation;
