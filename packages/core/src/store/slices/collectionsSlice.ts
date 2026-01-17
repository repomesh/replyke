import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { Collection } from "../../interfaces/models/Collection";

// State interface
export interface CollectionsState {
  // Single source of truth for all collections
  collectionsById: { [collectionId: string]: Collection };

  // Parent-child relationships mapping
  subcollectionsMap: { [parentId: string]: string[] };

  // Current navigation state
  currentCollectionId: string | null;

  // Navigation history (just IDs)
  collectionHistory: string[];

  // UI state
  loading: boolean;

  // Project context (needed for API calls)
  currentProjectId?: string;
}

// Initial state
const initialState: CollectionsState = {
  collectionsById: {},
  subcollectionsMap: {},
  currentCollectionId: null,
  collectionHistory: [],
  loading: false,
  currentProjectId: undefined,
};

// Create the slice
export const collectionsSlice = createSlice({
  name: "collections",
  initialState,
  reducers: {
    // Set the current project context
    setProjectContext: (state, action: PayloadAction<string>) => {
      state.currentProjectId = action.payload;
    },

    // Set loading state
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Navigation actions
    openCollection: (state, action: PayloadAction<Collection>) => {
      const collection = action.payload;

      // Store the collection if not already stored
      if (!state.collectionsById[collection.id]) {
        state.collectionsById[collection.id] = collection;
      }

      // Push current collection ID to history stack before opening new one
      if (state.currentCollectionId) {
        state.collectionHistory.push(state.currentCollectionId);
      }

      // Set new current collection ID
      state.currentCollectionId = collection.id;
    },

    goBack: (state) => {
      if (state.collectionHistory.length === 0) return;

      const previousCollectionId = state.collectionHistory.pop();
      if (!previousCollectionId) return;

      state.currentCollectionId = previousCollectionId;
    },

    goToRoot: (state) => {
      if (state.collectionHistory.length === 0) return;

      const rootCollectionId = state.collectionHistory[0];
      state.collectionHistory = [];
      state.currentCollectionId = rootCollectionId;
    },

    // Set current collection (for initial root collection fetch)
    setCurrentCollection: (state, action: PayloadAction<Collection | null>) => {
      const collection = action.payload;
      if (collection) {
        state.collectionsById[collection.id] = collection;
        state.currentCollectionId = collection.id;
      } else {
        state.currentCollectionId = null;
      }
    },

    // Set sub-collections and update mapping
    setSubCollections: (
      state,
      action: PayloadAction<{ collections: Collection[]; parentCollectionId: string }>
    ) => {
      const { collections, parentCollectionId } = action.payload;

      // Store all collections in collectionsById
      collections.forEach(collection => {
        state.collectionsById[collection.id] = collection;
      });

      // Update parent-child mapping
      state.subcollectionsMap[parentCollectionId] = collections.map(collection => collection.id);
    },

    // Update current collection (for entity add/remove operations)
    updateCurrentCollection: (state, action: PayloadAction<Collection>) => {
      const updatedCollection = action.payload;

      // Update in collectionsById (single source of truth)
      state.collectionsById[updatedCollection.id] = updatedCollection;
    },

    // Update a collection (now just updates in collectionsById)
    updateCollectionInSubCollections: (state, action: PayloadAction<Collection>) => {
      const updatedCollection = action.payload;

      // Update in collectionsById (single source of truth)
      state.collectionsById[updatedCollection.id] = updatedCollection;
    },

    // Add new collection to sub-collections and navigate to it
    addNewCollectionAndNavigate: (state, action: PayloadAction<Collection>) => {
      const newCollection = action.payload;

      if (!state.currentCollectionId) return;

      // Store the new collection
      state.collectionsById[newCollection.id] = newCollection;

      // Push current collection ID to history
      state.collectionHistory.push(state.currentCollectionId);

      // Set new collection as current
      state.currentCollectionId = newCollection.id;

      // Update parent-child mapping
      if (newCollection.parentId) {
        if (!state.subcollectionsMap[newCollection.parentId]) {
          state.subcollectionsMap[newCollection.parentId] = [];
        }
        if (!state.subcollectionsMap[newCollection.parentId].includes(newCollection.id)) {
          state.subcollectionsMap[newCollection.parentId].push(newCollection.id);
        }
      }
    },

    // Remove collection from sub-collections and storage
    removeCollectionFromSubCollections: (state, action: PayloadAction<string>) => {
      const collectionId = action.payload;

      // Remove from collectionsById
      delete state.collectionsById[collectionId];

      // Remove from all parent-child mappings
      Object.keys(state.subcollectionsMap).forEach((parentId) => {
        state.subcollectionsMap[parentId] = state.subcollectionsMap[parentId].filter(
          (id) => id !== collectionId
        );
      });

      // Remove its own sub-collections mapping if it exists
      delete state.subcollectionsMap[collectionId];
    },

    // Handle collection deletion
    handleCollectionDeletion: (
      state,
      action: PayloadAction<{ collectionId: string; parentId?: string | null }>
    ) => {
      const { collectionId, parentId } = action.payload;

      // Remove from parent-child mapping
      if (parentId && state.subcollectionsMap[parentId]) {
        state.subcollectionsMap[parentId] = state.subcollectionsMap[parentId].filter(
          (id) => id !== collectionId
        );
      }

      // Remove from collectionsById
      delete state.collectionsById[collectionId];

      // Remove its own sub-collections mapping
      delete state.subcollectionsMap[collectionId];

      // If deleted collection is current collection, go back
      if (state.currentCollectionId === collectionId) {
        if (state.collectionHistory.length === 0) {
          state.currentCollectionId = null;
          return;
        }

        const previousCollectionId = state.collectionHistory.pop();
        if (!previousCollectionId) {
          state.currentCollectionId = null;
          return;
        }

        state.currentCollectionId = previousCollectionId;
      }
    },

    // Reset all collections data
    resetCollections: (state) => {
      state.collectionsById = {};
      state.subcollectionsMap = {};
      state.currentCollectionId = null;
      state.collectionHistory = [];
      state.loading = false;
    },

    // Handle errors by stopping loading
    handleError: (state) => {
      state.loading = false;
    },
  },
});

// Export actions
export const {
  setProjectContext,
  setLoading,
  openCollection,
  goBack,
  goToRoot,
  setCurrentCollection,
  setSubCollections,
  updateCurrentCollection,
  updateCollectionInSubCollections,
  addNewCollectionAndNavigate,
  removeCollectionFromSubCollections,
  handleCollectionDeletion,
  resetCollections,
  handleError,
} = collectionsSlice.actions;

// Export reducer
export default collectionsSlice.reducer;

// Selectors
export const selectCurrentCollection = (state: { collections: CollectionsState }): Collection | null => {
  const { currentCollectionId, collectionsById } = state.collections;
  return currentCollectionId ? collectionsById[currentCollectionId] || null : null;
};

export const selectSubCollections = createSelector(
  [(state: { collections: CollectionsState }) => state.collections.currentCollectionId,
   (state: { collections: CollectionsState }) => state.collections.subcollectionsMap,
   (state: { collections: CollectionsState }) => state.collections.collectionsById],
  (currentCollectionId, subcollectionsMap, collectionsById): Collection[] => {
    if (!currentCollectionId || !subcollectionsMap[currentCollectionId]) {
      return [];
    }

    return subcollectionsMap[currentCollectionId]
      .map(collectionId => collectionsById[collectionId])
      .filter(Boolean); // Remove any undefined entries
  }
);

export const selectCollectionsLoading = (state: { collections: CollectionsState }) =>
  state.collections.loading;

export const selectCollectionHistory = createSelector(
  [(state: { collections: CollectionsState }) => state.collections.collectionHistory,
   (state: { collections: CollectionsState }) => state.collections.collectionsById],
  (collectionHistory, collectionsById): Collection[] => {
    return collectionHistory
      .map(collectionId => collectionsById[collectionId])
      .filter(Boolean); // Remove any undefined entries
  }
);

// New selector for the sub-collections mapping
export const selectSubCollectionsMap = (state: { collections: CollectionsState }) =>
  state.collections.subcollectionsMap;

// New selector for all collections
export const selectCollectionsById = (state: { collections: CollectionsState }) =>
  state.collections.collectionsById;

export const selectCurrentProjectId = (state: { collections: CollectionsState }) =>
  state.collections.currentProjectId;

// New selector for current collection ID
export const selectCurrentCollectionId = (state: { collections: CollectionsState }) =>
  state.collections.currentCollectionId;
