import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Entity } from "../../interfaces/models/Entity";
import { EntityListSortByOptions } from "../../interfaces/EntityListSortByOptions";
import { LocationFilters } from "../../interfaces/entity-filters/LocationFilters";
import { TimeFrame } from "../../interfaces/TimeFrame";
import { MetadataFilters } from "../../interfaces/entity-filters/MetadataFilters";
import { TitleFilters } from "../../interfaces/entity-filters/TitleFilters";
import { ContentFilters } from "../../interfaces/entity-filters/ContentFilters";
import { AttachmentsFilters } from "../../interfaces/entity-filters/AttachmentsFilters";
import { KeywordsFilters } from "../../interfaces/entity-filters/KeywordsFilters";

// Individual entity list state
export interface EntityListState {
  entities: Entity[];
  page: number;
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  lastFetched: number | null;

  // Filter/sort state
  limit: number;
  sortBy: EntityListSortByOptions;
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
}

// Root state for all entity lists
export interface EntityListsState {
  lists: { [listId: string]: EntityListState };
}

// Default state for a new entity list
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

// Initial state
const initialState: EntityListsState = {
  lists: {},
};

// Filter update payload interface
export interface FilterUpdatePayload {
  listId: string;
  filters: Partial<{
    sortBy: EntityListSortByOptions;
    timeFrame: TimeFrame | null;
    userId: string | null;
    followedOnly: boolean;
    keywordsFilters: KeywordsFilters | null;
    titleFilters: TitleFilters | null;
    contentFilters: ContentFilters | null;
    attachmentsFilters: AttachmentsFilters | null;
    locationFilters: LocationFilters | null;
    metadataFilters: MetadataFilters | null;
  }>;
  options?: {
    resetUnspecified?: boolean; // Reset any unspecified filters to their defaults
  };
}

// Initialize list payload interface
export interface InitializeListPayload {
  listId: string;
  limit?: number; // Hook-level configuration
  sourceId?: string | null; // Hook-level configuration
}

// Keywords update payload interface
export interface KeywordsUpdatePayload {
  listId: string;
  type: "add" | "remove" | "reset" | "replace";
  key: "includes" | "doesNotInclude" | "both";
  value?: string | string[];
}

// Entity operations payload interfaces
export interface EntityAddPayload {
  listId: string;
  entity: Entity;
  insertPosition?: "first" | "last";
}

export interface EntityRemovePayload {
  listId: string;
  entityId: string;
}

export interface EntitiesSetPayload {
  listId: string;
  entities: Entity[];
  append?: boolean;
}

// Create the slice
export const entityListsSlice = createSlice({
  name: "entityLists",
  initialState,
  reducers: {
    // Initialize or get existing list
    initializeList: (state, action: PayloadAction<InitializeListPayload>) => {
      const { listId, limit, sourceId } = action.payload;
      if (!state.lists[listId]) {
        const defaultState = createDefaultEntityListState();
        if (limit) {
          defaultState.limit = limit;
        }
        if (sourceId !== undefined) {
          defaultState.sourceId = sourceId;
        }
        state.lists[listId] = defaultState;
      }
    },

    // Update filters and sort (unified function)
    updateFiltersAndSort: (state, action: PayloadAction<FilterUpdatePayload>) => {
      const { listId, filters, options } = action.payload;

      // Ensure list exists
      if (!state.lists[listId]) {
        state.lists[listId] = createDefaultEntityListState();
      }

      const list = state.lists[listId];

      // If resetUnspecified is true, reset to defaults first
      if (options?.resetUnspecified) {
        const defaultState = createDefaultEntityListState();
        // Reset all filter properties to defaults (but keep limit and sourceId as hook-level config)
        list.sortBy = defaultState.sortBy;
        list.timeFrame = defaultState.timeFrame;
        list.userId = defaultState.userId;
        list.followedOnly = defaultState.followedOnly;
        list.keywordsFilters = defaultState.keywordsFilters;
        list.titleFilters = defaultState.titleFilters;
        list.contentFilters = defaultState.contentFilters;
        list.attachmentsFilters = defaultState.attachmentsFilters;
        list.locationFilters = defaultState.locationFilters;
        list.metadataFilters = defaultState.metadataFilters;
      }

      // Update specified filters
      Object.keys(filters).forEach((key) => {
        if (filters[key as keyof typeof filters] !== undefined) {
          (list as any)[key] = filters[key as keyof typeof filters];
        }
      });

      // Reset pagination when filters change
      list.page = 1;
      list.hasMore = true;
      list.error = null;
    },

    // Set loading state for entity list
    setEntityListLoading: (
      state,
      action: PayloadAction<{ listId: string; loading: boolean }>
    ) => {
      const { listId, loading } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].loading = loading;
      }
    },

    // Set entities for entity list
    setEntityListEntities: (state, action: PayloadAction<EntitiesSetPayload>) => {
      const { listId, entities, append = false } = action.payload;

      if (!state.lists[listId]) {
        state.lists[listId] = createDefaultEntityListState();
      }

      const list = state.lists[listId];

      if (append) {
        // Filter out duplicates when appending
        const existingIds = new Set(list.entities.map(e => e.id));
        const newEntities = entities.filter(e => !existingIds.has(e.id));
        list.entities = [...list.entities, ...newEntities];
      } else {
        list.entities = entities;
      }

      list.loading = false;
      list.lastFetched = Date.now();

      // Update hasMore based on returned entities length
      if (entities.length < list.limit) {
        list.hasMore = false;
      }
    },

    // Increment page for load more
    incrementPage: (state, action: PayloadAction<string>) => {
      const listId = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].page += 1;
      }
    },

    // Set hasMore for entity list
    setEntityListHasMore: (
      state,
      action: PayloadAction<{ listId: string; hasMore: boolean }>
    ) => {
      const { listId, hasMore } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].hasMore = hasMore;
      }
    },

    // Set error for entity list
    setEntityListError: (
      state,
      action: PayloadAction<{ listId: string; error: string | null }>
    ) => {
      const { listId, error } = action.payload;
      if (state.lists[listId]) {
        state.lists[listId].error = error;
        state.lists[listId].loading = false;
      }
    },

    // Add entity
    addEntity: (state, action: PayloadAction<EntityAddPayload>) => {
      const { listId, entity, insertPosition = "first" } = action.payload;

      if (!state.lists[listId]) return;

      const list = state.lists[listId];

      if (insertPosition === "last") {
        list.entities.push(entity);
      } else {
        list.entities.unshift(entity);
      }
    },

    // Remove entity
    removeEntity: (state, action: PayloadAction<EntityRemovePayload>) => {
      const { listId, entityId } = action.payload;

      if (!state.lists[listId]) return;

      const list = state.lists[listId];
      list.entities = list.entities.filter(e => e.id !== entityId);
    },

    // Update keywords filters (special case due to complexity)
    updateKeywordsFilters: (state, action: PayloadAction<KeywordsUpdatePayload>) => {
      const { listId, type, key, value } = action.payload;

      if (!state.lists[listId]) {
        state.lists[listId] = createDefaultEntityListState();
      }

      const list = state.lists[listId];
      const items = Array.isArray(value) ? value : value ? [value] : [];

      let newFilters = list.keywordsFilters || {};

      switch (type) {
        case "add": {
          if (key === "both") break; // Invalid to add to both

          newFilters = {
            ...newFilters,
            [key]: Array.from(new Set([...(newFilters[key] || []), ...items])),
          };
          break;
        }

        case "remove": {
          if (key === "both") {
            newFilters = {
              includes: (newFilters.includes || []).filter(
                (item) => !items.includes(item)
              ),
              doesNotInclude: (newFilters.doesNotInclude || []).filter(
                (item) => !items.includes(item)
              ),
            };
          } else {
            newFilters = {
              ...newFilters,
              [key]: (newFilters[key] || []).filter((item) => !items.includes(item)),
            };
          }
          break;
        }

        case "reset": {
          if (key === "both") {
            newFilters = {};
          } else {
            newFilters = {
              ...newFilters,
              [key]: undefined,
            };
          }
          break;
        }

        case "replace": {
          if (key === "both") break; // Replace does not apply to both
          newFilters = {
            ...newFilters,
            [key]: items,
          };
          break;
        }
      }

      list.keywordsFilters = Object.keys(newFilters).length > 0 ? newFilters : null;

      // Reset pagination when filters change
      list.page = 1;
      list.hasMore = true;
      list.error = null;
    },

    // Clean up unused lists (for memory management)
    cleanupList: (state, action: PayloadAction<string>) => {
      const listId = action.payload;
      delete state.lists[listId];
    },

    // Clean up old lists (older than TTL)
    cleanupOldLists: (state, action: PayloadAction<number>) => {
      const ttl = action.payload; // TTL in milliseconds
      const now = Date.now();

      Object.keys(state.lists).forEach(listId => {
        const list = state.lists[listId];
        if (list.lastFetched && (now - list.lastFetched) > ttl) {
          delete state.lists[listId];
        }
      });
    },
  },
});

// Export actions
export const {
  initializeList,
  updateFiltersAndSort,
  setEntityListLoading,
  setEntityListEntities,
  incrementPage,
  setEntityListHasMore,
  setEntityListError,
  addEntity,
  removeEntity,
  updateKeywordsFilters,
  cleanupList,
  cleanupOldLists,
} = entityListsSlice.actions;

// Selectors
export const selectEntityList = (state: { entityLists: EntityListsState }, listId: string): EntityListState | undefined =>
  state.entityLists.lists[listId];

export const selectEntityListEntities = (state: { entityLists: EntityListsState }, listId: string): Entity[] =>
  state.entityLists.lists[listId]?.entities || [];

export const selectEntityListLoading = (state: { entityLists: EntityListsState }, listId: string): boolean =>
  state.entityLists.lists[listId]?.loading || false;

export const selectEntityListHasMore = (state: { entityLists: EntityListsState }, listId: string): boolean =>
  state.entityLists.lists[listId]?.hasMore || false;

export const selectEntityListFilters = (state: { entityLists: EntityListsState }, listId: string) => {
  const list = state.entityLists.lists[listId];
  if (!list) return null;

  return {
    limit: list.limit,
    sortBy: list.sortBy,
    timeFrame: list.timeFrame,
    sourceId: list.sourceId,
    userId: list.userId,
    followedOnly: list.followedOnly,
    keywordsFilters: list.keywordsFilters,
    titleFilters: list.titleFilters,
    contentFilters: list.contentFilters,
    attachmentsFilters: list.attachmentsFilters,
    locationFilters: list.locationFilters,
    metadataFilters: list.metadataFilters,
  };
};

export default entityListsSlice.reducer;