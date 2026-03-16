import { useCallback, useEffect, useRef } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../../store/hooks";
import {
  selectMessages,
  selectMessagesLoading,
  selectMessagesHasMore,
  selectThreadReplies,
  selectThreadLoading,
  selectThreadHasMore,
  upsertMessage,
  setMessagesLoading,
  setMessagesHasMore,
  setThreadReplies,
  setThreadLoading,
} from "../../../store/slices/chatSlice";
import { IChatMessage } from "../../../interfaces/models/IChatMessage";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface UseChatMessagesProps {
  conversationId: string;
  parentId?: string | null;
  limit?: number;
  includeFiles?: boolean;
}

export interface UseChatMessagesValues {
  messages: IChatMessage[];
  loading: boolean;
  hasMore: boolean;
  loadOlder: () => Promise<void>;
}

function useChatMessages({
  conversationId,
  parentId,
  limit = 50,
  includeFiles,
}: UseChatMessagesProps): UseChatMessagesValues {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const isThread = Boolean(parentId);

  // Read from the correct Redux bucket
  const mainMessages = useReplykeSelector(selectMessages(conversationId));
  const mainLoading = useReplykeSelector(selectMessagesLoading(conversationId));
  const mainHasMore = useReplykeSelector(selectMessagesHasMore(conversationId));

  const threadMessages = useReplykeSelector(
    selectThreadReplies(parentId ?? "")
  );
  const threadLoading = useReplykeSelector(selectThreadLoading(parentId ?? ""));
  const threadHasMore = useReplykeSelector(
    selectThreadHasMore(parentId ?? "")
  );

  const messages = isThread ? threadMessages : mainMessages;
  const loading = isThread ? threadLoading : mainLoading;
  const hasMore = isThread ? threadHasMore : mainHasMore;

  // Keep a fresh ref to the main messages array so loadOlder can read the
  // oldest message's createdAt timestamp without closing over stale state
  const mainMessagesRef = useRef(mainMessages);
  mainMessagesRef.current = mainMessages;

  // Fetch a page of messages.
  // `before` is an ISO 8601 timestamp — the server queries messages created
  // before this point in time (not a UUID cursor).
  const fetchPage = useCallback(
    async (before: string | null) => {
      if (!projectId || !conversationId) return;

      const params: Record<string, any> = {
        limit,
        sort: isThread ? "asc" : "desc",
      };
      if (parentId) params.parentId = parentId;
      if (before) params.before = before;
      if (includeFiles) params.include = "files";

      try {
        const response = await axios.get(
          `/${projectId}/v7/chat/conversations/${conversationId}/messages`,
          { params }
        );
        const { messages: items, hasMore: more } = response.data as {
          messages: IChatMessage[];
          hasMore: boolean;
        };

        if (isThread) {
          // Thread replies come back ASC — dispatch as-is
          dispatch(
            setThreadReplies({
              parentMessageId: parentId!,
              messages: items,
              hasMore: more,
            })
          );
        } else {
          // Main stream comes back DESC (newest first for cursor efficiency).
          // Redux stores messages ASC — reverse before dispatching.
          const ascending = [...items].reverse();
          ascending.forEach((msg) => dispatch(upsertMessage(msg)));
          dispatch(setMessagesHasMore({ conversationId, hasMore: more }));
        }
      } catch (err) {
        handleError(err, "Failed to load messages");
      }
    },
    [projectId, conversationId, parentId, isThread, limit, includeFiles, axios, dispatch]
  );

  // Initial fetch on mount
  useEffect(() => {
    if (!projectId || !conversationId) return;

    const initialFetch = async () => {
      if (isThread) {
        dispatch(setThreadLoading({ parentMessageId: parentId!, loading: true }));
      } else {
        dispatch(setMessagesLoading({ conversationId, loading: true }));
      }

      await fetchPage(null);

      if (isThread) {
        dispatch(setThreadLoading({ parentMessageId: parentId!, loading: false }));
      } else {
        dispatch(setMessagesLoading({ conversationId, loading: false }));
      }
    };

    initialFetch();
    // Only re-run when the conversation/thread identity changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, conversationId, parentId]);

  // Load older messages using the oldest known message's createdAt as the
  // timestamp cursor. The server `before` param is an ISO 8601 timestamp.
  const loadOlder = useCallback(async () => {
    if (loading || !hasMore) return;

    if (isThread) {
      // Thread replies are fully loaded in one shot; pagination not supported yet
      return;
    }

    const oldest = mainMessagesRef.current[0];
    if (!oldest) return;

    const before = new Date(oldest.createdAt).toISOString();

    dispatch(setMessagesLoading({ conversationId, loading: true }));
    await fetchPage(before);
    dispatch(setMessagesLoading({ conversationId, loading: false }));
  }, [loading, hasMore, isThread, conversationId, dispatch, fetchPage]);

  return { messages, loading, hasMore, loadOlder };
}

export default useChatMessages;
