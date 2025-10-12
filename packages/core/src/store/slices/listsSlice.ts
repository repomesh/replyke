import { createSlice, PayloadAction, createSelector } from "@reduxjs/toolkit";
import type { List } from "../../interfaces/models/List";

// State interface
export interface ListsState {
  // Single source of truth for all lists
  listsById: { [listId: string]: List };

  // Parent-child relationships mapping
  sublistsMap: { [parentId: string]: string[] };

  // Current navigation state
  currentListId: string | null;

  // Navigation history (just IDs)
  listHistory: string[];

  // UI state
  loading: boolean;

  // Project context (needed for API calls)
  currentProjectId?: string;
}

// Initial state
const initialState: ListsState = {
  listsById: {},
  sublistsMap: {},
  currentListId: null,
  listHistory: [],
  loading: false,
  currentProjectId: undefined,
};

// Create the slice
export const listsSlice = createSlice({
  name: "lists",
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
    openList: (state, action: PayloadAction<List>) => {
      const list = action.payload;

      // Store the list if not already stored
      if (!state.listsById[list.id]) {
        state.listsById[list.id] = list;
      }

      // Push current list ID to history stack before opening new one
      if (state.currentListId) {
        state.listHistory.push(state.currentListId);
      }

      // Set new current list ID
      state.currentListId = list.id;
    },

    goBack: (state) => {
      if (state.listHistory.length === 0) return;

      const previousListId = state.listHistory.pop();
      if (!previousListId) return;

      state.currentListId = previousListId;
    },

    goToRoot: (state) => {
      if (state.listHistory.length === 0) return;

      const rootListId = state.listHistory[0];
      state.listHistory = [];
      state.currentListId = rootListId;
    },

    // Set current list (for initial root list fetch)
    setCurrentList: (state, action: PayloadAction<List | null>) => {
      const list = action.payload;
      if (list) {
        state.listsById[list.id] = list;
        state.currentListId = list.id;
      } else {
        state.currentListId = null;
      }
    },

    // Set sub-lists and update mapping
    setSubLists: (
      state,
      action: PayloadAction<{ lists: List[]; parentListId: string }>
    ) => {
      const { lists, parentListId } = action.payload;
      
      // Store all lists in listsById
      lists.forEach(list => {
        state.listsById[list.id] = list;
      });
      
      // Update parent-child mapping
      state.sublistsMap[parentListId] = lists.map(list => list.id);
    },

    // Update current list (for entity add/remove operations)
    updateCurrentList: (state, action: PayloadAction<List>) => {
      const updatedList = action.payload;
      
      // Update in listsById (single source of truth)
      state.listsById[updatedList.id] = updatedList;
    },

    // Update a list (now just updates in listsById)
    updateListInSubLists: (state, action: PayloadAction<List>) => {
      const updatedList = action.payload;
      
      // Update in listsById (single source of truth)
      state.listsById[updatedList.id] = updatedList;
    },

    // Add new list to sub-lists and navigate to it
    addNewListAndNavigate: (state, action: PayloadAction<List>) => {
      const newList = action.payload;

      if (!state.currentListId) return;

      // Store the new list
      state.listsById[newList.id] = newList;

      // Push current list ID to history
      state.listHistory.push(state.currentListId);

      // Set new list as current
      state.currentListId = newList.id;

      // Update parent-child mapping
      if (newList.parentId) {
        if (!state.sublistsMap[newList.parentId]) {
          state.sublistsMap[newList.parentId] = [];
        }
        if (!state.sublistsMap[newList.parentId].includes(newList.id)) {
          state.sublistsMap[newList.parentId].push(newList.id);
        }
      }
    },

    // Remove list from sub-lists and storage
    removeListFromSubLists: (state, action: PayloadAction<string>) => {
      const listId = action.payload;

      // Remove from listsById
      delete state.listsById[listId];

      // Remove from all parent-child mappings
      Object.keys(state.sublistsMap).forEach((parentId) => {
        state.sublistsMap[parentId] = state.sublistsMap[parentId].filter(
          (id) => id !== listId
        );
      });

      // Remove its own sublists mapping if it exists
      delete state.sublistsMap[listId];
    },

    // Handle list deletion
    handleListDeletion: (
      state,
      action: PayloadAction<{ listId: string; parentId?: string | null }>
    ) => {
      const { listId, parentId } = action.payload;

      // Remove from parent-child mapping
      if (parentId && state.sublistsMap[parentId]) {
        state.sublistsMap[parentId] = state.sublistsMap[parentId].filter(
          (id) => id !== listId
        );
      }

      // Remove from listsById
      delete state.listsById[listId];

      // Remove its own sublists mapping
      delete state.sublistsMap[listId];

      // If deleted list is current list, go back
      if (state.currentListId === listId) {
        if (state.listHistory.length === 0) {
          state.currentListId = null;
          return;
        }

        const previousListId = state.listHistory.pop();
        if (!previousListId) {
          state.currentListId = null;
          return;
        }

        state.currentListId = previousListId;
      }
    },

    // Reset all lists data
    resetLists: (state) => {
      state.listsById = {};
      state.sublistsMap = {};
      state.currentListId = null;
      state.listHistory = [];
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
  openList,
  goBack,
  goToRoot,
  setCurrentList,
  setSubLists,
  updateCurrentList,
  updateListInSubLists,
  addNewListAndNavigate,
  removeListFromSubLists,
  handleListDeletion,
  resetLists,
  handleError,
} = listsSlice.actions;

// Export reducer
export default listsSlice.reducer;

// Selectors
export const selectCurrentList = (state: { lists: ListsState }): List | null => {
  const { currentListId, listsById } = state.lists;
  return currentListId ? listsById[currentListId] || null : null;
};

export const selectSubLists = createSelector(
  [(state: { lists: ListsState }) => state.lists.currentListId,
   (state: { lists: ListsState }) => state.lists.sublistsMap,
   (state: { lists: ListsState }) => state.lists.listsById],
  (currentListId, sublistsMap, listsById): List[] => {
    if (!currentListId || !sublistsMap[currentListId]) {
      return [];
    }

    return sublistsMap[currentListId]
      .map(listId => listsById[listId])
      .filter(Boolean); // Remove any undefined entries
  }
);

export const selectListsLoading = (state: { lists: ListsState }) =>
  state.lists.loading;

export const selectListHistory = createSelector(
  [(state: { lists: ListsState }) => state.lists.listHistory,
   (state: { lists: ListsState }) => state.lists.listsById],
  (listHistory, listsById): List[] => {
    return listHistory
      .map(listId => listsById[listId])
      .filter(Boolean); // Remove any undefined entries
  }
);

// New selector for the sublists mapping
export const selectSubListsMap = (state: { lists: ListsState }) =>
  state.lists.sublistsMap;

// New selector for all lists
export const selectListsById = (state: { lists: ListsState }) =>
  state.lists.listsById;

export const selectCurrentProjectId = (state: { lists: ListsState }) =>
  state.lists.currentProjectId;

// New selector for current list ID
export const selectCurrentListId = (state: { lists: ListsState }) =>
  state.lists.currentListId;
