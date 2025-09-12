import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  setProjectContext,
  selectCurrentList,
  selectSubLists,
  selectListsLoading,
  selectListHistory,
  selectSubListsMap,
  selectCurrentProjectId,
} from "../../store/slices/listsSlice";
import { useListsActionsRedux } from "./useListsActionsRedux";
import useProject from "../projects/useProject";
import { useUserRedux } from "../auth-redux";
import type { List } from "../../interfaces/models/List";

export interface UseListsReduxProps {}

export interface UseListsReduxValues {
  currentList: List | null;
  subLists: List[];
  loading: boolean;

  openList: (list: List) => void;
  goBack: () => void;
  goToRoot: () => void;

  isEntityInList: (selectedEntityId: string) => boolean;

  createList: (props: { listName: string }) => Promise<void>;
  updateList: (props: {
    listId: string;
    update: Partial<{ name: string }>;
  }) => Promise<void>;
  deleteList: (props: { list: List }) => Promise<void>;
  addToList: (props: { entityId: string }) => Promise<void>;
  removeFromList: (props: { entityId: string }) => Promise<void>;
}

/**
 * Redux-powered hook that provides the exact same interface as useListsData()
 * This is a drop-in replacement for the Context-based hook
 */
function useListsRedux(_: UseListsReduxProps = {}): UseListsReduxValues {
  const dispatch = useDispatch<AppDispatch>();

  // Get external context
  const { projectId } = useProject();
  const { user } = useUserRedux();

  // Get Redux state
  const currentList = useSelector((state: RootState) =>
    selectCurrentList(state)
  );
  const subLists = useSelector((state: RootState) =>
    selectSubLists(state)
  );
  const loading = useSelector((state: RootState) =>
    selectListsLoading(state)
  );
  const listHistory = useSelector((state: RootState) =>
    selectListHistory(state)
  );
  const subListsMap = useSelector((state: RootState) =>
    selectSubListsMap(state)
  );
  const currentProjectId = useSelector((state: RootState) =>
    selectCurrentProjectId(state)
  );

  // Get actions
  const {
    openList,
    goBack,
    goToRoot,
    fetchRootList,
    fetchSubLists,
    createList: createListAction,
    updateList: updateListAction,
    deleteList: deleteListAction,
    addToList: addToListAction,
    removeFromList: removeFromListAction,
  } = useListsActionsRedux();

  // Update Redux state when project changes
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(setProjectContext(projectId));
    }
  }, [dispatch, projectId, currentProjectId]);

  // Fetch root list when user and project are available
  useEffect(() => {
    if (!user || !projectId) return;

    fetchRootList(projectId);
  }, [fetchRootList, user, projectId]);

  // Fetch sub-lists when current list changes
  useEffect(() => {
    if (!user || !projectId || !currentList) return;

    // Check if sub-lists for this list are already fetched
    if (subListsMap[currentList.id] !== undefined) {
      return; // No need to fetch, we already have the mapping (even if empty)
    }

    fetchSubLists(projectId, currentList.id);
  }, [fetchSubLists, user, projectId, currentList, subListsMap]);

  // Entity membership checker
  const isEntityInList = useCallback((selectedEntityId: string): boolean => {
    if (!currentList) return false;
    return currentList.entityIds.some(entityId => entityId === selectedEntityId);
  }, [currentList]);

  // Wrapped CRUD operations that match the original interface
  const handleCreateList = useCallback(
    async ({ listName }: { listName: string }) => {
      if (!listName) {
        console.error("No listName provided.");
        return;
      }

      if (!currentList) {
        console.error("No current list.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await createListAction(projectId, currentList.id, listName);
    },
    [createListAction, currentList, projectId]
  );

  const handleUpdateList = useCallback(
    async ({
      listId,
      update,
    }: {
      listId: string;
      update: Partial<{ name: string }>;
    }) => {
      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await updateListAction(projectId, listId, update);
    },
    [updateListAction, projectId]
  );

  const handleDeleteList = useCallback(
    async ({ list }: { list: List }) => {
      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await deleteListAction(projectId, list);
    },
    [deleteListAction, projectId]
  );

  const handleAddToList = useCallback(
    async ({ entityId }: { entityId: string }) => {
      if (!entityId) {
        console.error("No entityId provided.");
        return;
      }

      if (!currentList) {
        console.error("No current list.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await addToListAction(projectId, currentList.id, entityId);
    },
    [addToListAction, currentList, projectId]
  );

  const handleRemoveFromList = useCallback(
    async ({ entityId }: { entityId: string }) => {
      if (!currentList) {
        console.error("No current list.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await removeFromListAction(projectId, currentList.id, entityId);
    },
    [removeFromListAction, currentList, projectId]
  );

  // Return the same interface as the original hook
  return useMemo(
    () => ({
      currentList,
      subLists,
      loading,

      openList,
      goBack,
      goToRoot,

      isEntityInList,

      createList: handleCreateList,
      updateList: handleUpdateList,
      deleteList: handleDeleteList,
      addToList: handleAddToList,
      removeFromList: handleRemoveFromList,
    }),
    [
      currentList,
      subLists,
      loading,
      openList,
      goBack,
      goToRoot,
      isEntityInList,
      handleCreateList,
      handleUpdateList,
      handleDeleteList,
      handleAddToList,
      handleRemoveFromList,
    ]
  );
}

export default useListsRedux;