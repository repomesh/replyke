import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  initializeList,
  updateFiltersAndSort,
  setEntityListLoading,
  setEntityListEntities,
  incrementPage,
  setEntityListHasMore,
  setEntityListError,
  addEntity,
  removeEntity,
  selectEntityList,
  selectEntityListEntities,
  selectEntityListLoading,
  selectEntityListHasMore,
  selectEntityListFilters,
  type FilterUpdatePayload,
  type EntityListState,
} from "../../store/slices/entityListsSlice";

import useFetchManyEntities from "../entity-lists/useFetchManyEntities";
import useInfusedData from "../entity-lists/useInfusedData";
import useCreateEntity from "../entities/useCreateEntity";
import useDeleteEntity from "../entities/useDeleteEntity";

import { Entity } from "../../interfaces/models/Entity";
import { EntityListSortByOptions } from "../../interfaces/EntityListSortByOptions";
import { LocationFilters } from "../../interfaces/entity-filters/LocationFilters";
import { TimeFrame } from "../../interfaces/TimeFrame";
import { MetadataFilters } from "../../interfaces/entity-filters/MetadataFilters";
import { TitleFilters } from "../../interfaces/entity-filters/TitleFilters";
import { ContentFilters } from "../../interfaces/entity-filters/ContentFilters";
import { AttachmentsFilters } from "../../interfaces/entity-filters/AttachmentsFilters";
import { KeywordsFilters } from "../../interfaces/entity-filters/KeywordsFilters";

import { handleError } from "../../utils/handleError";

// Helper function to create default entity list state (same as in slice)
const createDefaultEntityListState = (): EntityListState => ({
  entities: [],
  page: 1,
  loading: false,
  hasMore: true,
  error: null,
  lastFetched: null,

  // Default filters
  limit: 10,
  sortBy: "hot",
  timeFrame: null,
  sourceId: null,
  userId: null,
  followedOnly: false,
  keywordsFilters: null,
  titleFilters: null,
  contentFilters: null,
  attachmentsFilters: null,
  locationFilters: null,
  metadataFilters: null,
});

export interface UseEntityListReduxProps {
  listId: string;
  limit?: number; // Default: 10
  sourceId?: string | null; // Stable source configuration
  infuseData?: (foreignId: string) => Promise<Record<string, any> | null>;
}

export interface UseEntityListReduxValues {
  entities: Entity[];
  // setEntities: React.Dispatch<React.SetStateAction<Entity[]>>;

  infusedEntities: (Entity & Record<string, any>)[];

  loading: boolean;
  hasMore: boolean;

  sortBy: EntityListSortByOptions | null;
  timeFrame: TimeFrame | null;
  sourceId: string | null;
  userId: string | null;
  followedOnly: boolean;
  keywordsFilters: KeywordsFilters | null;
  titleFilters: TitleFilters | null;
  contentFilters: ContentFilters | null;
  attachmentsFilters: AttachmentsFilters | null;
  locationFilters: LocationFilters | null;
  metadataFilters: MetadataFilters | null;

  fetchEntities: (
    filters: Partial<{
      sortBy?: EntityListSortByOptions;
      timeFrame?: TimeFrame | null;
      userId?: string | null;
      followedOnly?: boolean;
      keywordsFilters?: KeywordsFilters | null;
      titleFilters?: TitleFilters | null;
      contentFilters?: ContentFilters | null;
      attachmentsFilters?: AttachmentsFilters | null;
      locationFilters?: LocationFilters | null;
      metadataFilters?: MetadataFilters | null;
    }>,
    options?: {
      resetUnspecified?: boolean;
      immediate?: boolean;
    }
  ) => void;


  loadMore: () => void;
  createEntity: (props: {
    foreignId?: string;
    title?: string;
    content?: string;
    attachments?: Record<string, any>[];
    keywords?: string[];
    location?: {
      latitude: number;
      longitude: number;
    };
    metadata?: Record<string, any>;
    insertPosition?: "first" | "last";
  }) => Promise<Entity | undefined>;
  deleteEntity: (props: { entityId: string }) => Promise<void>;
}

function useEntityListRedux({
  listId,
  limit = 10,
  sourceId,
  infuseData,
}: UseEntityListReduxProps): UseEntityListReduxValues {
  const dispatch = useDispatch<AppDispatch>();

  // Initialize list if it doesn't exist
  useEffect(() => {
    dispatch(initializeList({ listId, limit, sourceId }));
  }, [dispatch, listId, limit, sourceId]);

  // Get state from Redux
  const entityList = useSelector((state: RootState) => selectEntityList(state, listId));
  const entities = useSelector((state: RootState) => selectEntityListEntities(state, listId));
  const loading = useSelector((state: RootState) => selectEntityListLoading(state, listId));
  const hasMore = useSelector((state: RootState) => selectEntityListHasMore(state, listId));
  const filters = useSelector((state: RootState) => selectEntityListFilters(state, listId));

  // Get entity hooks
  const fetchManyEntities = useFetchManyEntities();
  const createEntityHook = useCreateEntity();
  const deleteEntityHook = useDeleteEntity();

  // Infused data
  const infusedEntities = useInfusedData({ entities, infuseData });

  // Debounce timer for filter changes
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);


  // Fetch entities function (always triggers a fetch)
  const handleFetchEntities = useCallback((
    newFilters: Partial<FilterUpdatePayload['filters']>,
    options?: { resetUnspecified?: boolean; immediate?: boolean }
  ) => {
    // Update filters in Redux state first
    dispatch(updateFiltersAndSort({ listId, filters: newFilters, options }));

    // Calculate the final filters that will be used for the fetch
    // We need to merge current entityList state with the new filters, but use hook props as fallback
    const defaultState = createDefaultEntityListState();

    // Start with default state, but override with hook props for limit and sourceId
    const baseFilters = {
      ...defaultState,
      limit: limit, // Use hook prop limit
      sourceId: sourceId, // Use hook prop sourceId
    };

    // If entityList exists, use its values, otherwise use baseFilters
    const currentFilters = entityList ? { ...entityList } : baseFilters;

    // Apply resetUnspecified logic
    let finalFilters = { ...currentFilters };
    if (options?.resetUnspecified) {
      finalFilters = {
        ...currentFilters,
        // Reset filter properties to defaults (but keep limit and sourceId from hook props)
        sortBy: defaultState.sortBy,
        timeFrame: defaultState.timeFrame,
        userId: defaultState.userId,
        followedOnly: defaultState.followedOnly,
        keywordsFilters: defaultState.keywordsFilters,
        titleFilters: defaultState.titleFilters,
        contentFilters: defaultState.contentFilters,
        attachmentsFilters: defaultState.attachmentsFilters,
        locationFilters: defaultState.locationFilters,
        metadataFilters: defaultState.metadataFilters,
        // Preserve hook-level configs
        limit: limit,
        sourceId: sourceId,
      };
    }

    // Apply new filters
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key as keyof typeof newFilters] !== undefined) {
        (finalFilters as any)[key] = newFilters[key as keyof typeof newFilters];
      }
    });

    // Define the fetch logic using the calculated final filters
    const performFetch = async () => {
      if (!finalFilters.sortBy) return; // sortBy is required

      dispatch(setEntityListLoading({ listId, loading: true }));

      try {
        console.log(`[EntityListRedux] Fetching entities for listId: ${listId}`, {
          filters: finalFilters,
          sourceId: finalFilters.sourceId,
        });

        const newEntities = await fetchManyEntities({
          page: 1,
          sortBy: finalFilters.sortBy,
          timeFrame: finalFilters.timeFrame,
          userId: finalFilters.userId,
          sourceId: finalFilters.sourceId ?? null,
          followedOnly: finalFilters.followedOnly,
          limit: finalFilters.limit,
          locationFilters: finalFilters.locationFilters,
          keywordsFilters: finalFilters.keywordsFilters,
          metadataFilters: finalFilters.metadataFilters,
          titleFilters: finalFilters.titleFilters,
          contentFilters: finalFilters.contentFilters,
          attachmentsFilters: finalFilters.attachmentsFilters,
        });

        console.log(`[EntityListRedux] Fetched ${newEntities?.length || 0} entities for listId: ${listId}`);

        if (newEntities) {
          dispatch(setEntityListEntities({ listId, entities: newEntities, append: false }));
          dispatch(setEntityListHasMore({ listId, hasMore: newEntities.length >= finalFilters.limit }));
        }
      } catch (err) {
        console.error(`[EntityListRedux] Failed to fetch entities for listId: ${listId}`, err);
        handleError(err, "Failed to fetch entities:");
        dispatch(setEntityListError({ listId, error: "Failed to fetch entities" }));
      } finally {
        dispatch(setEntityListLoading({ listId, loading: false }));
      }
    };

    // Execute immediately if requested, otherwise debounce
    // For initial loads (empty filters object), make it immediate by default
    const shouldBeImmediate = options?.immediate || Object.keys(newFilters).length === 0;

    if (shouldBeImmediate) {
      performFetch();
    } else {
      // Clear existing debounce timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Debounce the actual fetch
      debounceTimer.current = setTimeout(() => {
        performFetch();
      }, 800); // 800ms debounce delay
    }
  }, [dispatch, listId, entityList, fetchManyEntities]);



  // Load more function
  const loadMore = useCallback(() => {
    if (!entityList || loading || !hasMore) return;

    dispatch(incrementPage(listId));
  }, [dispatch, listId, entityList, loading, hasMore]);

  // Create entity function
  const createEntity = useCallback(async ({
    insertPosition,
    ...restOfProps
  }: {
    foreignId?: string;
    title?: string;
    content?: string;
    media?: any[];
    keywords?: string[];
    location?: {
      latitude: number;
      longitude: number;
    };
    metadata?: Record<string, any>;
    insertPosition?: "first" | "last";
  }) => {
    try {
      const newEntity = await createEntityHook({
        ...restOfProps,
        sourceId: entityList?.sourceId || undefined
      });

      dispatch(addEntity({
        listId,
        entity: newEntity,
        insertPosition
      }));

      return newEntity;
    } catch (err) {
      handleError(err, "Failed to create entity");
    }
  }, [createEntityHook, dispatch, listId, entityList]);

  // Delete entity function
  const deleteEntity = useCallback(async ({ entityId }: { entityId: string }) => {
    try {
      await deleteEntityHook({ entityId });
      dispatch(removeEntity({ listId, entityId }));
    } catch (err) {
      handleError(err, "Failed to delete entity");
    }
  }, [deleteEntityHook, dispatch, listId]);

  // Load more entities when page changes
  useEffect(() => {
    const loadMoreEntities = async () => {
      if (!entityList || entityList.page <= 1) return;

      dispatch(setEntityListLoading({ listId, loading: true }));

      try {
        console.log(`[EntityListRedux] Loading more entities (page ${entityList.page}) for listId: ${listId}`);

        const newEntities = await fetchManyEntities({
          page: entityList.page,
          userId: entityList.userId,
          sourceId: entityList.sourceId ?? null,
          followedOnly: entityList.followedOnly,
          sortBy: entityList.sortBy,
          limit: entityList.limit,
          timeFrame: entityList.timeFrame,
          locationFilters: entityList.locationFilters,
          keywordsFilters: entityList.keywordsFilters,
          metadataFilters: entityList.metadataFilters,
          titleFilters: entityList.titleFilters,
          contentFilters: entityList.contentFilters,
          attachmentsFilters: entityList.attachmentsFilters,
        });

        console.log(`[EntityListRedux] Loaded ${newEntities?.length || 0} more entities (page ${entityList.page}) for listId: ${listId}`);

        if (newEntities) {
          dispatch(setEntityListEntities({ listId, entities: newEntities, append: true }));
          dispatch(setEntityListHasMore({ listId, hasMore: newEntities.length >= entityList.limit }));
        }
      } catch (err) {
        console.error(`[EntityListRedux] Failed to load more entities for listId: ${listId}`, err);
        handleError(err, "Loading more entities failed:");
        dispatch(setEntityListError({ listId, error: "Failed to load more entities" }));
      } finally {
        dispatch(setEntityListLoading({ listId, loading: false }));
      }
    };

    if (entityList?.page && entityList.page > 1) {
      loadMoreEntities();
    }
  }, [dispatch, listId, entityList?.page, fetchManyEntities]);

  // fetchEntities now handles fetching directly when called
  // No automatic filter change detection needed

  // Legacy setEntities function for compatibility
  const handleSetEntities = useCallback((updater: React.SetStateAction<Entity[]>) => {
    if (typeof updater === 'function') {
      const newEntities = updater(entities);
      dispatch(setEntityListEntities({ listId, entities: newEntities, append: false }));
    } else {
      dispatch(setEntityListEntities({ listId, entities: updater, append: false }));
    }
  }, [dispatch, listId, entities]);

  return useMemo(() => ({
    entities,
    // setEntities: handleSetEntities,
    infusedEntities,

    loading,
    hasMore,

    sortBy: filters?.sortBy || null,
    timeFrame: filters?.timeFrame || null,
    sourceId: filters?.sourceId || null,
    userId: filters?.userId || null,
    followedOnly: filters?.followedOnly || false,

    keywordsFilters: filters?.keywordsFilters || null,
    titleFilters: filters?.titleFilters || null,
    contentFilters: filters?.contentFilters || null,
    attachmentsFilters: filters?.attachmentsFilters || null,
    locationFilters: filters?.locationFilters || null,
    metadataFilters: filters?.metadataFilters || null,

    fetchEntities: handleFetchEntities,

    loadMore,
    createEntity,
    deleteEntity,
  }), [
    entities,
    handleSetEntities,
    infusedEntities,
    loading,
    hasMore,
    filters,
    handleFetchEntities,
    loadMore,
    createEntity,
    deleteEntity,
  ]);
}

export default useEntityListRedux;