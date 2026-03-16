import { useCallback, useEffect, useRef } from "react";
import { useReplykeDispatch, useReplykeSelector } from "../../../store/hooks";
import {
  selectConversationList,
  selectConversationListHasMore,
  selectConversationListLoading,
  setConversationList,
  setConversationListLoading,
  setConversationListHasMore,
} from "../../../store/slices/chatSlice";
import { IConversationPreview } from "../../../interfaces/models/IConversation";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface UseConversationsProps {
  types?: ("direct" | "group" | "space")[];
}

export interface UseConversationsValues {
  conversations: IConversationPreview[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  createGroup: (params: {
    name?: string;
    metadata?: Record<string, unknown>;
  }) => Promise<IConversationPreview>;
}

// Two-cursor state derived from the last item returned by the server.
// The server does NOT return a cursor field; we compute it from the response.
interface CursorState {
  cursor: string | null; // last item's lastMessageAt (ISO string)
  cursorCreatedAt: string | null; // last item's createdAt (ISO string)
}

function useConversations({
  types,
}: UseConversationsProps = {}): UseConversationsValues {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const conversations = useReplykeSelector(selectConversationList);
  const loading = useReplykeSelector(selectConversationListLoading);
  const hasMore = useReplykeSelector(selectConversationListHasMore);

  const typesKey = types ? [...types].sort().join(",") : "";

  // Keep fresh refs to avoid stale closures in useCallback
  const conversationsRef = useRef(conversations);
  conversationsRef.current = conversations;

  // Local two-cursor ref — NOT stored in Redux to avoid schema changes
  const cursorRef = useRef<CursorState>({ cursor: null, cursorCreatedAt: null });

  const fetchPage = useCallback(
    async (cursors: CursorState | null, isRefresh: boolean) => {
      if (!projectId) return;

      dispatch(setConversationListLoading(true));
      try {
        const params: Record<string, string> = { limit: "20" };
        if (types && types.length > 0) params.types = types.join(",");
        if (cursors?.cursor) params.cursor = cursors.cursor;
        if (cursors?.cursorCreatedAt) params.cursorCreatedAt = cursors.cursorCreatedAt;

        const response = await axios.get(`/${projectId}/v7/chat/conversations`, {
          params,
        });

        const { conversations: items, hasMore: more } = response.data as {
          conversations: IConversationPreview[];
          hasMore: boolean;
        };

        // Derive the next cursor from the last item in the response
        if (items.length > 0) {
          const last = items[items.length - 1];
          cursorRef.current = {
            cursor: last.lastMessageAt ?? null,
            cursorCreatedAt: last.createdAt ?? null,
          };
        } else if (isRefresh) {
          cursorRef.current = { cursor: null, cursorCreatedAt: null };
        }

        if (isRefresh) {
          dispatch(setConversationList(items));
        } else {
          // Append to existing list, deduplicating by id
          const current = conversationsRef.current;
          dispatch(
            setConversationList(
              current.concat(
                items.filter((item) => !current.some((c) => c.id === item.id))
              )
            )
          );
        }
        dispatch(setConversationListHasMore(more));
      } catch (err) {
        handleError(err, "Failed to load conversations");
      } finally {
        dispatch(setConversationListLoading(false));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [projectId, typesKey]
  );

  // Initial fetch on mount (or when types/projectId changes)
  useEffect(() => {
    if (!projectId) return;
    cursorRef.current = { cursor: null, cursorCreatedAt: null };
    fetchPage(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, typesKey]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    await fetchPage(cursorRef.current, false);
  }, [loading, hasMore, fetchPage]);

  const refresh = useCallback(async () => {
    cursorRef.current = { cursor: null, cursorCreatedAt: null };
    await fetchPage(null, true);
  }, [fetchPage]);

  const createGroup = useCallback(
    async (params: {
      name?: string;
      metadata?: Record<string, unknown>;
    }): Promise<IConversationPreview> => {
      if (!projectId) throw new Error("No project ID");

      const response = await axios.post(
        `/${projectId}/v7/chat/conversations`,
        { type: "group", ...params }
      );

      const conversation = response.data as IConversationPreview;

      // Prepend to the current list so it appears immediately
      const current = conversationsRef.current;
      dispatch(setConversationList([conversation, ...current]));

      return conversation;
    },
    [projectId, axios, dispatch]
  );

  return { conversations, loading, hasMore, loadMore, refresh, createGroup };
}

export default useConversations;
