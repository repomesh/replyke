import { useCallback, useEffect, useRef, useState } from "react";
import { Entity, EntityIncludeParam } from "../../interfaces/models/Entity";
import { useLazyFetchCollectionEntitiesQuery } from "../../store/api/collectionsApi";
import { handleError } from "../../utils/handleError";
import useProject from "../projects/useProject";
import useCollections from "./useCollections";

export interface UseCollectionEntitiesWrapperProps {
  collectionId?: string | null; // Optional - defaults to current collection from Redux
  limit?: number;
  include?: EntityIncludeParam;
  defaultSortBy?: "new" | "top" | "hot" | "added";
  defaultSortDir?: "asc" | "desc";
}

export interface UseCollectionEntitiesWrapperValues {
  entities: Entity[];
  loading: boolean;
  hasMore: boolean;
  sortBy: "new" | "top" | "hot" | "added";
  sortDir: "asc" | "desc";
  setSortBy: (newSortBy: "new" | "top" | "hot" | "added") => void;
  setSortDir: (newSortDir: "asc" | "desc") => void;
  loadMore: () => void;
  refetch: () => void;
}

function useCollectionEntitiesWrapper(
  props: UseCollectionEntitiesWrapperProps
): UseCollectionEntitiesWrapperValues {
  const {
    collectionId: passedCollectionId,
    limit = 20,
    defaultSortBy = "added",
    defaultSortDir = "desc",
    include,
  } = props;

  const { projectId } = useProject();
  const { currentCollection } = useCollections();
  const [fetchCollectionEntitiesQuery] = useLazyFetchCollectionEntitiesQuery();

  // Use passed collectionId if provided, otherwise default to current collection
  const effectiveCollectionId = passedCollectionId ?? currentCollection?.id;

  const loading = useRef(false);
  const [loadingState, setLoadingState] = useState(false);

  const hasMore = useRef(true);
  const [hasMoreState, setHasMoreState] = useState(true);

  const [sortBy, setSortBy] = useState<"new" | "top" | "hot" | "added">(
    defaultSortBy
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(defaultSortDir);
  const [page, setPage] = useState(1);
  const [entities, setEntities] = useState<Entity[]>([]);

  // Reset entities when filters or collection change
  const resetEntities = useCallback(async () => {
    if (!projectId || !effectiveCollectionId) {
      return;
    }

    try {
      loading.current = true;
      setLoadingState(true);

      hasMore.current = true;
      setHasMoreState(true);

      setPage(1);

      const response = await fetchCollectionEntitiesQuery({
        projectId,
        collectionId: effectiveCollectionId,
        page: 1,
        limit,
        sortBy,
        sortDir,
        include,
      }).unwrap();

      if (response) {
        const { data: newEntities, pagination } = response;
        setEntities(newEntities);
        hasMore.current = pagination.hasMore;
        setHasMoreState(pagination.hasMore);
      }
    } catch (err) {
      handleError(err, "Failed to fetch collection entities:");
    } finally {
      loading.current = false;
      setLoadingState(false);
    }
  }, [
    fetchCollectionEntitiesQuery,
    projectId,
    effectiveCollectionId,
    limit,
    sortBy,
    sortDir,
    include,
  ]);

  // Load more entities
  const loadMore = useCallback(() => {
    if (loading.current || !hasMore.current) return;
    setPage((prevPage) => prevPage + 1);
  }, []);

  // Initial load
  useEffect(() => {
    resetEntities();
  }, [resetEntities]);

  // Load more pages
  useEffect(() => {
    const loadMoreEntities = async () => {
      if (!projectId || !effectiveCollectionId) {
        return;
      }

      loading.current = true;
      setLoadingState(true);

      try {
        const response = await fetchCollectionEntitiesQuery({
          projectId,
          collectionId: effectiveCollectionId,
          page,
          limit,
          sortBy,
          sortDir,
          include,
        }).unwrap();

        if (response) {
          const { data: newEntities, pagination } = response;
          setEntities((prevEntities) => [...prevEntities, ...newEntities]);
          hasMore.current = pagination.hasMore;
          setHasMoreState(pagination.hasMore);
        }
      } catch (err) {
        handleError(err, "Loading more collection entities failed:");
      } finally {
        loading.current = false;
        setLoadingState(false);
      }
    };

    // Only load more if page > 1 (not initial load)
    if (page > 1 && hasMore.current && !loading.current) {
      loadMoreEntities();
    }
  }, [
    page,
    fetchCollectionEntitiesQuery,
    projectId,
    effectiveCollectionId,
    limit,
    sortBy,
    sortDir,
    include,
  ]);

  return {
    entities,
    loading: loadingState,
    hasMore: hasMoreState,
    sortBy,
    sortDir,
    setSortBy,
    setSortDir,
    loadMore,
    refetch: resetEntities,
  };
}

export default useCollectionEntitiesWrapper;
