import { useCallback, useEffect, useMemo, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  initializeList,
  updateFiltersAndSort,
  setEntityListLoading,
  setEntityListEntities,
  incrementPage,
  selectEntityList,
  selectEntityListEntities,
  selectEntityListLoading,
  selectEntityListHasMore,
  selectEntityListFilters,
  selectEntityListConfig,
  type EntityListState,
  type EntityListFilters,
  type EntityListConfig,
  type EntityListFetchOptions,
} from "../../store/slices/entityListsSlice";

import useInfusedData from "./useInfusedData";
import useEntityListActions from "./useEntityListActions";

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

export interface UseEntityListProps {
  listId: string;
  infuseData?: (foreignId: string) => Promise<Record<string, any> | null>;
}

export interface UseEntityListValues {
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
    filters: Partial<EntityListFilters>,
    config?: EntityListConfig,
    options?: EntityListFetchOptions
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

function useEntityList({
  listId,
  infuseData,
}: UseEntityListProps): UseEntityListValues {
  const dispatch = useDispatch<AppDispatch>();

  // Get state from Redux
  const entityList = useSelector((state: RootState) =>
    selectEntityList(state, listId)
  );
  const entities = useSelector((state: RootState) =>
    selectEntityListEntities(state, listId)
  );
  const loading = useSelector((state: RootState) =>
    selectEntityListLoading(state, listId)
  );
  const hasMore = useSelector((state: RootState) =>
    selectEntityListHasMore(state, listId)
  );
  const filters = useSelector((state: RootState) =>
    selectEntityListFilters(state, listId)
  );
  const config = useSelector((state: RootState) =>
    selectEntityListConfig(state, listId)
  );

  // Get entity actions hook
  const entityActions = useEntityListActions();

  // Infused data
  const infusedEntities = useInfusedData({ entities, infuseData });

  // Debounce timer for filter changes
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch entities function (always triggers a fetch)
  const handleFetchEntities = useCallback(
    (
      newFilters: Partial<EntityListFilters>,
      newConfig?: EntityListConfig,
      options?: EntityListFetchOptions
    ) => {
      // Apply config defaults if not provided
      const configWithDefaults = {
        sourceId: null,
        limit: 10,
        ...newConfig,
      };

      // Ensure Redux state is initialized and update filters/config
      dispatch(initializeList({ listId }));
      dispatch(updateFiltersAndSort({
        listId,
        filters: newFilters,
        config: configWithDefaults,
        options
      }));

      // Clear entities immediately if requested
      if (options?.clearImmediately) {
        dispatch(
          setEntityListEntities({ listId, entities: [], append: false })
        );
      }

      // Define the fetch logic
      const performFetch = async () => {
        // Use the applied config (configWithDefaults is the source of truth for this fetch)
        const currentConfig = { sourceId: configWithDefaults.sourceId, limit: configWithDefaults.limit };

        // Build final filters by taking current state and applying new filters
        // Use entityList if available, otherwise get current state from Redux after our updates
        const currentState = entityList || {
          sortBy: "hot",
          timeFrame: null,
          userId: null,
          followedOnly: false,
          keywordsFilters: null,
          titleFilters: null,
          contentFilters: null,
          attachmentsFilters: null,
          locationFilters: null,
          metadataFilters: null,
        };
        const finalFilters = { ...currentState };

        // Apply resetUnspecified logic (only reset filter properties, not config)
        if (options?.resetUnspecified) {
          // Reset only filter properties to defaults, keep config and state properties as-is
          finalFilters.sortBy = "hot";
          finalFilters.timeFrame = null;
          finalFilters.userId = null;
          finalFilters.followedOnly = false;
          finalFilters.keywordsFilters = null;
          finalFilters.titleFilters = null;
          finalFilters.contentFilters = null;
          finalFilters.attachmentsFilters = null;
          finalFilters.locationFilters = null;
          finalFilters.metadataFilters = null;
        }

        // Apply new filters
        Object.keys(newFilters).forEach((key) => {
          if (newFilters[key as keyof typeof newFilters] !== undefined) {
            (finalFilters as any)[key] =
              newFilters[key as keyof typeof newFilters];
          }
        });

        if (!finalFilters.sortBy) return; // sortBy is required

        dispatch(setEntityListLoading({ listId, loading: true }));

        try {
          await entityActions.fetchEntities(listId, {
            page: 1,
            // User-controlled filters from Redux state + new filters
            sortBy: finalFilters.sortBy,
            timeFrame: finalFilters.timeFrame,
            userId: finalFilters.userId,
            followedOnly: finalFilters.followedOnly,
            locationFilters: finalFilters.locationFilters,
            keywordsFilters: finalFilters.keywordsFilters,
            metadataFilters: finalFilters.metadataFilters,
            titleFilters: finalFilters.titleFilters,
            contentFilters: finalFilters.contentFilters,
            attachmentsFilters: finalFilters.attachmentsFilters,
            // Configuration parameters from current config
            limit: currentConfig.limit,
            sourceId: currentConfig.sourceId,
          });
        } catch (err) {
          console.error(
            `[EntityListRedux] Failed to fetch entities for listId: ${listId}`,
            err
          );
        }
      };

      // Execute immediately if requested, otherwise debounce
      // For initial loads (empty filters object), make it immediate by default
      const shouldBeImmediate =
        options?.immediate || Object.keys(newFilters).length === 0;

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
    },
    [dispatch, listId, entityList, config, entityActions.fetchEntities]
  );

  // Load more function
  const loadMore = useCallback(async () => {
    if (!entityList || loading || !hasMore) return;

    // Check if fetchEntities has been called before (safeguard)
    if (!config) {
      console.error(
        `[EntityListRedux] loadMore called before fetchEntities for listId: ${listId}. ` +
        `fetchEntities must be called first to initialize configuration.`
      );
      return;
    }

    const nextPage = entityList.page + 1;
    dispatch(incrementPage(listId));

    // Directly fetch the next page
    try {
      await entityActions.fetchEntities(listId, {
        page: nextPage,
        // User-controlled filters from Redux state
        userId: entityList.userId,
        followedOnly: entityList.followedOnly,
        sortBy: entityList.sortBy,
        timeFrame: entityList.timeFrame,
        locationFilters: entityList.locationFilters,
        keywordsFilters: entityList.keywordsFilters,
        metadataFilters: entityList.metadataFilters,
        titleFilters: entityList.titleFilters,
        contentFilters: entityList.contentFilters,
        attachmentsFilters: entityList.attachmentsFilters,
        // Configuration parameters from state (single source of truth)
        limit: config.limit,
        sourceId: config.sourceId,
      });
    } catch (err) {
      console.error(
        `[EntityListRedux] Failed to load more entities for listId: ${listId}`,
        err
      );
    }
  }, [
    dispatch,
    listId,
    config,
    entityList,
    loading,
    hasMore,
    entityActions.fetchEntities,
  ]);

  // Create entity function
  const createEntity = useCallback(
    async ({
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
        const newEntity = await entityActions.createEntity(listId, {
          ...restOfProps,
          sourceId: config?.sourceId || null,
          insertPosition,
        });

        return newEntity;
      } catch (err) {
        // Error handling is now done in entityActions.createEntity
        handleError(err, "Failed to create entity");
      }
    },
    [entityActions.createEntity, dispatch, listId, config]
  );

  // Delete entity function
  const deleteEntity = useCallback(
    async ({ entityId }: { entityId: string }) => {
      try {
        await entityActions.deleteEntity(listId, { entityId });
      } catch (err) {
        // Error handling is now done in entityActions.deleteEntity
        handleError(err, "Failed to delete entity");
      }
    },
    [entityActions.deleteEntity, dispatch, listId]
  );

  // Load more entities when page changes - REMOVED
  // This useEffect was causing duplicate API calls and race conditions
  // Load more is now handled directly in the loadMore function

  // fetchEntities now handles fetching directly when called
  // No automatic filter change detection needed

  // Legacy setEntities function for compatibility
  // const handleSetEntities = useCallback(
  //   (updater: React.SetStateAction<Entity[]>) => {
  //     if (typeof updater === "function") {
  //       const newEntities = updater(entities);
  //       dispatch(
  //         setEntityListEntities({
  //           listId,
  //           entities: newEntities,
  //           append: false,
  //         })
  //       );
  //     } else {
  //       dispatch(
  //         setEntityListEntities({ listId, entities: updater, append: false })
  //       );
  //     }
  //   },
  //   [dispatch, listId, entities]
  // );

  // No automatic initialization - state is only created when fetchEntities is called

  return useMemo(
    () => ({
      entities,
      // setEntities: handleSetEntities,
      infusedEntities,

      loading,
      hasMore,

      sortBy: filters?.sortBy || null,
      timeFrame: filters?.timeFrame || null,
      sourceId: config?.sourceId || null,
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
    }),
    [
      entities,
      infusedEntities,
      loading,
      hasMore,
      filters,
      config,
      handleFetchEntities,
      loadMore,
      createEntity,
      deleteEntity,
    ]
  );
}

export default useEntityList;
