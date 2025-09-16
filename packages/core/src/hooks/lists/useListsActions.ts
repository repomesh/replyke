import { useCallback, useMemo } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../store";
import {
  setLoading,
  openList,
  goBack,
  goToRoot,
  setCurrentList,
  setSubLists,
  updateCurrentList,
  updateListInSubLists,
  addNewListAndNavigate,
  handleListDeletion,
  resetLists,
  handleError,
} from "../../store/slices/listsSlice";
import {
  useLazyFetchRootListQuery,
  useLazyFetchSubListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useAddToListMutation,
  useRemoveFromListMutation,
} from "../../store/api/listsApi";
import { handleError as handleErrorUtil } from "../../utils/handleError";
import type { List } from "../../interfaces/models/List";

/**
 * Redux-powered hook that provides all lists actions
 * This replaces the individual hooks and provides a centralized way to manage lists
 */
export function useListsActions() {
  const dispatch = useDispatch<AppDispatch>();

  // RTK Query hooks
  const [fetchRootListQuery] = useLazyFetchRootListQuery();
  const [fetchSubListsQuery] = useLazyFetchSubListsQuery();
  const [createListMutation] = useCreateListMutation();
  const [updateListMutation] = useUpdateListMutation();
  const [deleteListMutation] = useDeleteListMutation();
  const [addToListMutation] = useAddToListMutation();
  const [removeFromListMutation] = useRemoveFromListMutation();

  // Navigation actions
  const openListAction = useCallback((list: List) => {
    dispatch(openList(list));
  }, [dispatch]);

  const goBackAction = useCallback(() => {
    dispatch(goBack());
  }, [dispatch]);

  const goToRootAction = useCallback(() => {
    dispatch(goToRoot());
  }, [dispatch]);

  // Fetch root list
  const fetchRootList = useCallback(async (projectId: string) => {
    if (!projectId) {
      console.warn("Can't fetch root list without projectId.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await fetchRootListQuery({ projectId }).unwrap();
      if (result) {
        // Set parentId to null for root list
        const rootList = { ...result, parentId: null };
        dispatch(setCurrentList(rootList));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed fetching root list");
      dispatch(handleError());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchRootListQuery]);

  // Fetch sub-lists
  const fetchSubLists = useCallback(async (projectId: string, listId: string) => {
    if (!projectId || !listId) {
      console.warn("Can't fetch sub-lists without projectId and listId.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await fetchSubListsQuery({ projectId, listId }).unwrap();
      if (result) {
        dispatch(setSubLists({ lists: result, parentListId: listId }));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed fetching sub-lists");
      dispatch(handleError());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchSubListsQuery]);

  // Create list
  const createList = useCallback(async (
    projectId: string,
    parentListId: string,
    listName: string
  ): Promise<void> => {
    if (!projectId || !parentListId || !listName) {
      console.error("Missing required parameters for creating list.");
      return;
    }

    try {
      const result = await createListMutation({
        projectId,
        parentListId,
        listName,
      }).unwrap();

      if (result) {
        dispatch(addNewListAndNavigate(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to create list");
    }
  }, [createListMutation, dispatch]);

  // Update list
  const updateList = useCallback(async (
    projectId: string,
    listId: string,
    update: Partial<{ name: string }>
  ): Promise<void> => {
    if (!projectId || !listId) {
      console.error("Missing required parameters for updating list.");
      return;
    }

    try {
      const result = await updateListMutation({
        projectId,
        listId,
        update,
      }).unwrap();

      if (result) {
        // Check if it's the current list or a sub-list
        dispatch(updateListInSubLists(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to update list");
    }
  }, [updateListMutation, dispatch]);

  // Delete list
  const deleteList = useCallback(async (
    projectId: string,
    list: List
  ): Promise<void> => {
    if (!projectId || !list) {
      console.error("Missing required parameters for deleting list.");
      return;
    }

    try {
      await deleteListMutation({
        projectId,
        listId: list.id,
      }).unwrap();

      dispatch(handleListDeletion({ listId: list.id, parentId: list.parentId }));
    } catch (err) {
      handleErrorUtil(err, "Failed to delete list");
    }
  }, [deleteListMutation, dispatch]);

  // Add entity to list
  const addToList = useCallback(async (
    projectId: string,
    listId: string,
    entityId: string
  ): Promise<void> => {
    if (!projectId || !listId || !entityId) {
      console.error("Missing required parameters for adding to list.");
      return;
    }

    try {
      const result = await addToListMutation({
        projectId,
        listId,
        entityId,
      }).unwrap();

      if (result) {
        dispatch(updateCurrentList(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to add entity to list");
    }
  }, [addToListMutation, dispatch]);

  // Remove entity from list
  const removeFromList = useCallback(async (
    projectId: string,
    listId: string,
    entityId: string
  ): Promise<void> => {
    if (!projectId || !listId || !entityId) {
      console.error("Missing required parameters for removing from list.");
      return;
    }

    try {
      const result = await removeFromListMutation({
        projectId,
        listId,
        entityId,
      }).unwrap();

      if (result) {
        dispatch(updateCurrentList(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to remove entity from list");
    }
  }, [removeFromListMutation, dispatch]);

  // Reset lists
  const resetListsAction = useCallback(() => {
    dispatch(resetLists());
  }, [dispatch]);

  return useMemo(
    () => ({
      // Navigation
      openList: openListAction,
      goBack: goBackAction,
      goToRoot: goToRootAction,

      // Data fetching
      fetchRootList,
      fetchSubLists,

      // CRUD operations
      createList,
      updateList,
      deleteList,
      addToList,
      removeFromList,

      // Utility
      resetLists: resetListsAction,
    }),
    [
      openListAction,
      goBackAction,
      goToRootAction,
      fetchRootList,
      fetchSubLists,
      createList,
      updateList,
      deleteList,
      addToList,
      removeFromList,
      resetListsAction,
    ]
  );
}

export default useListsActions;