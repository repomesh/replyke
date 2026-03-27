import { useCallback } from "react";
import { useReplykeDispatch } from "../../../store/hooks";
import { removeMessage } from "../../../store/slices/chatSlice";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface DeleteMessageParams {
  conversationId: string;
  messageId: string;
}

function useDeleteMessage(): (params: DeleteMessageParams) => Promise<void> {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const deleteMsg = useCallback(
    async ({ conversationId, messageId }: DeleteMessageParams): Promise<void> => {
      if (!projectId) throw new Error("No projectId available.");

      try {
        await axios.delete(
          `/${projectId}/chat/conversations/${conversationId}/messages/${messageId}`
        );
        // Soft-remove locally — mirrors the server-side soft-delete behavior
        dispatch(removeMessage({ conversationId, messageId }));
      } catch (err) {
        handleError(err, "Failed to delete message");
        throw err;
      }
    },
    [projectId, axios, dispatch]
  );

  return deleteMsg;
}

export default useDeleteMessage;
