import { useCallback, useEffect } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../../store/hooks";
import {
  selectConversation,
  selectConversationLoading,
  setConversation,
  setConversationLoading,
} from "../../../store/slices/chatSlice";
import { IConversation } from "../../../interfaces/models/IConversation";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface UseConversationProps {
  conversationId: string;
}

export interface UpdateConversationParams {
  name?: string;
  description?: string;
  avatarFileId?: string | null;
  postingPermission?: "members" | "admins";
}

export interface UseConversationValues {
  conversation: IConversation | null;
  loading: boolean;
  update: (params: UpdateConversationParams) => Promise<IConversation | undefined>;
  deleteConversation: () => Promise<void>;
}

function useConversation({
  conversationId,
}: UseConversationProps): UseConversationValues {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const conversation = useReplykeSelector(selectConversation(conversationId));
  const loading = useReplykeSelector(selectConversationLoading(conversationId));

  // Fetch conversation on mount if not already loaded
  useEffect(() => {
    if (!projectId || !conversationId || conversation) return;

    const fetchConversation = async () => {
      dispatch(setConversationLoading({ conversationId, loading: true }));
      try {
        const response = await axios.get(
          `/${projectId}/chat/conversations/${conversationId}`
        );
        dispatch(setConversation(response.data as IConversation));
      } catch (err) {
        handleError(err, "Failed to fetch conversation");
        dispatch(setConversationLoading({ conversationId, loading: false }));
      }
    };

    fetchConversation();
  }, [projectId, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    async (params: UpdateConversationParams): Promise<IConversation | undefined> => {
      if (!projectId || !conversationId) return;
      try {
        const response = await axios.patch(
          `/${projectId}/chat/conversations/${conversationId}`,
          params
        );
        const updated = response.data as IConversation;
        dispatch(setConversation(updated));
        return updated;
      } catch (err) {
        handleError(err, "Failed to update conversation");
        throw err;
      }
    },
    [projectId, conversationId, axios, dispatch]
  );

  const deleteConversation = useCallback(async () => {
    if (!projectId || !conversationId) return;
    try {
      await axios.delete(`/${projectId}/chat/conversations/${conversationId}`);
    } catch (err) {
      handleError(err, "Failed to delete conversation");
      throw err;
    }
  }, [projectId, conversationId, axios]);

  return { conversation, loading, update, deleteConversation };
}

export default useConversation;
