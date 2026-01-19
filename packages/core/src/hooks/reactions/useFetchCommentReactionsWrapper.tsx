import { useCallback, useEffect, useRef, useState } from "react";
import { Reaction, ReactionType } from "../../interfaces/models/Reaction";
import useFetchCommentReactions from "./useFetchCommentReactions";
import { handleError } from "../../utils/handleError";

export interface UseFetchCommentReactionsWrapperProps {
  commentId: string;
  limit?: number;
  reactionType?: ReactionType;
  sortDir?: "asc" | "desc";
  autoFetch?: boolean;
}

export interface UseFetchCommentReactionsWrapperValues {
  reactions: Reaction[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

function useFetchCommentReactionsWrapper(
  props: UseFetchCommentReactionsWrapperProps
): UseFetchCommentReactionsWrapperValues {
  const {
    commentId,
    limit = 20,
    reactionType,
    sortDir = "desc",
    autoFetch = false,
  } = props;

  const fetchCommentReactions = useFetchCommentReactions();

  const loading = useRef(false);
  const [loadingState, setLoadingState] = useState(false);

  const hasMore = useRef(true);
  const [hasMoreState, setHasMoreState] = useState(true);

  const [page, setPage] = useState(1);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const resetReactions = useCallback(async () => {
    if (!commentId) {
      return;
    }

    try {
      loading.current = true;
      setLoadingState(true);

      hasMore.current = true;
      setHasMoreState(true);

      setPage(1);

      const response = await fetchCommentReactions({
        commentId,
        page: 1,
        limit,
        reactionType,
        sortDir,
      });

      if (response) {
        const { data: newReactions, pagination } = response;
        setReactions(newReactions);
        hasMore.current = pagination.hasMore;
        setHasMoreState(pagination.hasMore);
      }
    } catch (err) {
      handleError(err, "Failed to reset reactions:");
    } finally {
      loading.current = false;
      setLoadingState(false);
    }
  }, [fetchCommentReactions, limit, reactionType, sortDir, commentId]);

  const loadMore = () => {
    if (loading.current || !hasMore.current) return;
    setPage((prevPage) => prevPage + 1);
  };

  useEffect(() => {
    if (autoFetch) {
      resetReactions();
    }
  }, [resetReactions, autoFetch]);

  useEffect(() => {
    const loadMoreReactions = async () => {
      loading.current = true;
      setLoadingState(true);
      try {
        const response = await fetchCommentReactions({
          commentId,
          page,
          limit,
          reactionType,
          sortDir,
        });

        if (response) {
          const { data: newReactions, pagination } = response;
          setReactions((prevReactions) => [...prevReactions, ...newReactions]);
          hasMore.current = pagination.hasMore;
          setHasMoreState(pagination.hasMore);
        }
      } catch (err) {
        handleError(err, "Loading more reactions failed:");
      } finally {
        loading.current = false;
        setLoadingState(false);
      }
    };

    if (page > 1 && hasMore.current && !loading.current) {
      loadMoreReactions();
    }
  }, [page, fetchCommentReactions, commentId, limit, reactionType, sortDir]);

  return {
    reactions,
    loading: loadingState,
    hasMore: hasMoreState,
    loadMore,
    refetch: resetReactions,
  };
}

export default useFetchCommentReactionsWrapper;
