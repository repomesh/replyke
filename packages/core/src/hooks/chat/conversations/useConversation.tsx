import { useCallback, useEffect } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../../store/hooks";
import {
  selectConversation,
  selectConversationLoading,
  setConversation,
  setConversationLoading,
} from "../../../store/slices/chatSlice";
import { Conversation } from "../../../interfaces/models/Conversation";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";
import useFetchConversation from "./useFetchConversation";
import useUpdateConversation from "./useUpdateConversation";
import { UpdateConversationParams } from "./useUpdateConversation";
import useDeleteConversation from "./useDeleteConversation";

export interface UseConversationProps {
  conversationId: string;
}

export interface UseConversationValues {
  conversation: Conversation | null;
  loading: boolean;
  update: (params: Omit<UpdateConversationParams, "conversationId">) => Promise<Conversation | undefined>;
  deleteConversation: () => Promise<void>;
}

function useConversation({
  conversationId,
}: UseConversationProps): UseConversationValues {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();

  const conversation = useReplykeSelector(selectConversation(conversationId));
  const loading = useReplykeSelector(selectConversationLoading(conversationId));

  const fetchConversation = useFetchConversation();
  const _update = useUpdateConversation();
  const _delete = useDeleteConversation();

  // Fetch conversation on mount if not already loaded
  useEffect(() => {
    if (!projectId || !conversationId || conversation) return;

    const load = async () => {
      dispatch(setConversationLoading({ conversationId, loading: true }));
      try {
        const fetched = await fetchConversation({ conversationId });
        dispatch(setConversation(fetched));
      } catch (err) {
        handleError(err, "Failed to fetch conversation");
        dispatch(setConversationLoading({ conversationId, loading: false }));
      }
    };

    load();
  }, [projectId, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const update = useCallback(
    async (
      params: Omit<UpdateConversationParams, "conversationId">
    ): Promise<Conversation | undefined> => {
      const updated = await _update({ conversationId, ...params });
      if (updated) dispatch(setConversation(updated));
      return updated;
    },
    [_update, conversationId, dispatch]
  );

  const deleteConversation = useCallback(async () => {
    await _delete({ conversationId });
  }, [_delete, conversationId]);

  return { conversation, loading, update, deleteConversation };
}

export default useConversation;
