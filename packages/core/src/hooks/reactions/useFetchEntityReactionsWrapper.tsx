import { useCallback, useEffect, useRef, useState } from "react";
import { Reaction, ReactionType } from "../../interfaces/models/Reaction";
import useFetchEntityReactions from "./useFetchEntityReactions";
import { handleError } from "../../utils/handleError";

export interface UseFetchEntityReactionsWrapperProps {
  entityId: string;
  limit?: number;
  reactionType?: ReactionType;
  sortDir?: "asc" | "desc";
  autoFetch?: boolean;
}

export interface UseFetchEntityReactionsWrapperValues {
  reactions: Reaction[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  refetch: () => void;
}

function useFetchEntityReactionsWrapper(
  props: UseFetchEntityReactionsWrapperProps
): UseFetchEntityReactionsWrapperValues {
  const {
    entityId,
    limit = 20,
    reactionType,
    sortDir = "desc",
    autoFetch = false,
  } = props;

  const fetchEntityReactions = useFetchEntityReactions();

  const loading = useRef(false);
  const [loadingState, setLoadingState] = useState(false);

  const hasMore = useRef(true);
  const [hasMoreState, setHasMoreState] = useState(true);

  const [page, setPage] = useState(1);
  const [reactions, setReactions] = useState<Reaction[]>([]);

  const resetReactions = useCallback(async () => {
    if (!entityId) {
      return;
    }

    try {
      loading.current = true;
      setLoadingState(true);

      hasMore.current = true;
      setHasMoreState(true);

      setPage(1);

      const response = await fetchEntityReactions({
        entityId,
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
  }, [fetchEntityReactions, limit, reactionType, sortDir, entityId]);

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
        const response = await fetchEntityReactions({
          entityId,
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
  }, [page, fetchEntityReactions, entityId, limit, reactionType, sortDir]);

  return {
    reactions,
    loading: loadingState,
    hasMore: hasMoreState,
    loadMore,
    refetch: resetReactions,
  };
}

export default useFetchEntityReactionsWrapper;
