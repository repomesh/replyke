import { useCallback, useMemo } from "react";
import { useReplykeDispatch } from "../../store/hooks";
import {
  setLoading,
  openCollection,
  goBack,
  goToRoot,
  setCurrentCollection,
  setSubCollections,
  updateCollectionInSubCollections,
  addNewCollectionAndNavigate,
  handleCollectionDeletion,
  resetCollections,
  handleError,
} from "../../store/slices/collectionsSlice";
import {
  useLazyFetchRootCollectionQuery,
  useLazyFetchSubCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddToCollectionMutation,
  useRemoveFromCollectionMutation,
} from "../../store/api/collectionsApi";
import { handleError as handleErrorUtil } from "../../utils/handleError";
import type { Collection } from "../../interfaces/models/Collection";

export interface UseCollectionsActionsValues {
  openCollection: (collection: Collection) => void;
  goBack: () => void;
  goToRoot: () => void;
  fetchRootCollection: (projectId: string) => Promise<void>;
  fetchSubCollections: (projectId: string, collectionId: string) => Promise<void>;
  createCollection: (projectId: string, parentCollectionId: string, collectionName: string) => Promise<void>;
  updateCollection: (projectId: string, collectionId: string, update: Partial<{ name: string }>) => Promise<void>;
  deleteCollection: (projectId: string, collection: Collection) => Promise<void>;
  addToCollection: (projectId: string, collectionId: string, entityId: string) => Promise<void>;
  removeFromCollection: (projectId: string, collectionId: string, entityId: string) => Promise<void>;
  resetCollections: () => void;
}

/**
 * Redux-powered hook that provides all collection actions
 * This replaces the individual hooks and provides a centralized way to manage collections
 */
export function useCollectionsActions(): UseCollectionsActionsValues {
  const dispatch = useReplykeDispatch();

  // RTK Query hooks
  const [fetchRootCollectionQuery] = useLazyFetchRootCollectionQuery();
  const [fetchSubCollectionsQuery] = useLazyFetchSubCollectionsQuery();
  const [createCollectionMutation] = useCreateCollectionMutation();
  const [updateCollectionMutation] = useUpdateCollectionMutation();
  const [deleteCollectionMutation] = useDeleteCollectionMutation();
  const [addToCollectionMutation] = useAddToCollectionMutation();
  const [removeFromCollectionMutation] = useRemoveFromCollectionMutation();

  // Navigation actions
  const openCollectionAction = useCallback((collection: Collection) => {
    dispatch(openCollection(collection));
  }, [dispatch]);

  const goBackAction = useCallback(() => {
    dispatch(goBack());
  }, [dispatch]);

  const goToRootAction = useCallback(() => {
    dispatch(goToRoot());
  }, [dispatch]);

  // Fetch root collection
  const fetchRootCollection = useCallback(async (projectId: string) => {
    if (!projectId) {
      console.warn("Can't fetch root collection without projectId.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await fetchRootCollectionQuery({ projectId }).unwrap();
      if (result) {
        // Set parentId to null for root collection
        const rootCollection = { ...result, parentId: null };
        dispatch(setCurrentCollection(rootCollection));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed fetching root collection");
      dispatch(handleError());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchRootCollectionQuery]);

  // Fetch sub-collections
  const fetchSubCollections = useCallback(async (projectId: string, collectionId: string) => {
    if (!projectId || !collectionId) {
      console.warn("Can't fetch sub-collections without projectId and collectionId.");
      return;
    }

    dispatch(setLoading(true));

    try {
      const result = await fetchSubCollectionsQuery({ projectId, collectionId }).unwrap();
      if (result) {
        dispatch(setSubCollections({ collections: result, parentCollectionId: collectionId }));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed fetching sub-collections");
      dispatch(handleError());
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, fetchSubCollectionsQuery]);

  // Create collection
  const createCollection = useCallback(async (
    projectId: string,
    parentCollectionId: string,
    collectionName: string
  ): Promise<void> => {
    if (!projectId || !parentCollectionId || !collectionName) {
      console.error("Missing required parameters for creating collection.");
      return;
    }

    try {
      const result = await createCollectionMutation({
        projectId,
        parentCollectionId,
        collectionName,
      }).unwrap();

      if (result) {
        dispatch(addNewCollectionAndNavigate(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to create collection");
    }
  }, [createCollectionMutation, dispatch]);

  // Update collection
  const updateCollection = useCallback(async (
    projectId: string,
    collectionId: string,
    update: Partial<{ name: string }>
  ): Promise<void> => {
    if (!projectId || !collectionId) {
      console.error("Missing required parameters for updating collection.");
      return;
    }

    try {
      const result = await updateCollectionMutation({
        projectId,
        collectionId,
        update,
      }).unwrap();

      if (result) {
        // Check if it's the current collection or a sub-collection
        dispatch(updateCollectionInSubCollections(result));
      }
    } catch (err) {
      handleErrorUtil(err, "Failed to update collection");
    }
  }, [updateCollectionMutation, dispatch]);

  // Delete collection
  const deleteCollection = useCallback(async (
    projectId: string,
    collection: Collection
  ): Promise<void> => {
    if (!projectId || !collection) {
      console.error("Missing required parameters for deleting collection.");
      return;
    }

    try {
      await deleteCollectionMutation({
        projectId,
        collectionId: collection.id,
      }).unwrap();

      dispatch(handleCollectionDeletion({ collectionId: collection.id, parentId: collection.parentId }));
    } catch (err) {
      handleErrorUtil(err, "Failed to delete collection");
    }
  }, [deleteCollectionMutation, dispatch]);

  // Add entity to collection
  const addToCollection = useCallback(async (
    projectId: string,
    collectionId: string,
    entityId: string
  ): Promise<void> => {
    if (!projectId || !collectionId || !entityId) {
      console.error("Missing required parameters for adding to collection.");
      return;
    }

    try {
      await addToCollectionMutation({
        projectId,
        collectionId,
        entityId,
      }).unwrap();
      // Note: Entity data is no longer stored in collections.
      // RTK Query will handle cache invalidation for CollectionEntities.
    } catch (err) {
      handleErrorUtil(err, "Failed to add entity to collection");
    }
  }, [addToCollectionMutation]);

  // Remove entity from collection
  const removeFromCollection = useCallback(async (
    projectId: string,
    collectionId: string,
    entityId: string
  ): Promise<void> => {
    if (!projectId || !collectionId || !entityId) {
      console.error("Missing required parameters for removing from collection.");
      return;
    }

    try {
      await removeFromCollectionMutation({
        projectId,
        collectionId,
        entityId,
      }).unwrap();
      // Note: Entity data is no longer stored in collections.
      // RTK Query will handle cache invalidation for CollectionEntities.
    } catch (err) {
      handleErrorUtil(err, "Failed to remove entity from collection");
    }
  }, [removeFromCollectionMutation]);

  // Reset collections
  const resetCollectionsAction = useCallback(() => {
    dispatch(resetCollections());
  }, [dispatch]);

  return useMemo(
    () => ({
      // Navigation
      openCollection: openCollectionAction,
      goBack: goBackAction,
      goToRoot: goToRootAction,

      // Data fetching
      fetchRootCollection,
      fetchSubCollections,

      // CRUD operations
      createCollection,
      updateCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,

      // Utility
      resetCollections: resetCollectionsAction,
    }),
    [
      openCollectionAction,
      goBackAction,
      goToRootAction,
      fetchRootCollection,
      fetchSubCollections,
      createCollection,
      updateCollection,
      deleteCollection,
      addToCollection,
      removeFromCollection,
      resetCollectionsAction,
    ]
  );
}

export default useCollectionsActions;