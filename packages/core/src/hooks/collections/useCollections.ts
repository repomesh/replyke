import { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";

import {
  setProjectContext,
  selectCurrentCollection,
  selectSubCollections,
  selectCollectionsLoading,
  selectSubCollectionsMap,
  selectCurrentProjectId,
} from "../../store/slices/collectionsSlice";
import { useCollectionsActions } from "./useCollectionsActions";
import useProject from "../projects/useProject";
import { useUser } from "../user";
import type { Collection } from "../../interfaces/models/Collection";

export interface UseCollectionsProps {}

export interface UseCollectionsValues {
  currentCollection: Collection | null;
  subCollections: Collection[];
  loading: boolean;

  openCollection: (collection: Collection) => void;
  goBack: () => void;
  goToRoot: () => void;

  isEntityInCollection: (selectedEntityId: string, collectionId?: string) => boolean;

  createCollection: (props: { collectionName: string }) => Promise<void>;
  updateCollection: (props: {
    collectionId: string;
    update: Partial<{ name: string }>;
  }) => Promise<void>;
  deleteCollection: (props: { collection: Collection }) => Promise<void>;
  addToCollection: (props: { entityId: string }) => Promise<void>;
  removeFromCollection: (props: { entityId: string }) => Promise<void>;
}

/**
 * Redux-powered hook that provides the exact same interface as useCollectionsData()
 * This is a drop-in replacement for the Context-based hook
 */
function useCollections(_: UseCollectionsProps = {}): UseCollectionsValues {
  const dispatch = useDispatch<AppDispatch>();

  // Get external context
  const { projectId } = useProject();
  const { user } = useUser();

  // Get Redux state
  const currentCollection = useSelector((state: RootState) =>
    selectCurrentCollection(state)
  );
  const subCollections = useSelector((state: RootState) =>
    selectSubCollections(state)
  );
  const loading = useSelector((state: RootState) =>
    selectCollectionsLoading(state)
  );
  const subCollectionsMap = useSelector((state: RootState) =>
    selectSubCollectionsMap(state)
  );
  const collectionsById = useSelector((state: RootState) =>
    state.collections.collectionsById
  );
  const currentProjectId = useSelector((state: RootState) =>
    selectCurrentProjectId(state)
  );

  // Get actions
  const {
    openCollection,
    goBack,
    goToRoot,
    fetchRootCollection,
    fetchSubCollections,
    createCollection: createCollectionAction,
    updateCollection: updateCollectionAction,
    deleteCollection: deleteCollectionAction,
    addToCollection: addToCollectionAction,
    removeFromCollection: removeFromCollectionAction,
  } = useCollectionsActions();

  // Update Redux state when project changes
  useEffect(() => {
    if (projectId && projectId !== currentProjectId) {
      dispatch(setProjectContext(projectId));
    }
  }, [dispatch, projectId, currentProjectId]);

  // Fetch root collection when user and project are available
  useEffect(() => {
    if (!user || !projectId) return;

    fetchRootCollection(projectId);
  }, [fetchRootCollection, user, projectId]);

  // Fetch sub-collections when current collection changes
  useEffect(() => {
    if (!user || !projectId || !currentCollection) return;

    // Check if sub-collections for this collection are already fetched
    if (subCollectionsMap[currentCollection.id] !== undefined) {
      return; // No need to fetch, we already have the mapping (even if empty)
    }

    fetchSubCollections(projectId, currentCollection.id);
  }, [fetchSubCollections, user, projectId, currentCollection, subCollectionsMap]);

  // Entity membership checker - checks if entity is in specified collection (or current collection if not specified)
  const isEntityInCollection = useCallback((selectedEntityId: string, collectionId?: string): boolean => {
    const targetCollection = collectionId ? collectionsById[collectionId] : currentCollection;
    if (!targetCollection) return false;
    return targetCollection.entityIds.some(entityId => entityId === selectedEntityId);
  }, [currentCollection, collectionsById]);

  // Wrapped CRUD operations that match the original interface
  const handleCreateCollection = useCallback(
    async ({ collectionName }: { collectionName: string }) => {
      if (!collectionName) {
        console.error("No collectionName provided.");
        return;
      }

      if (!currentCollection) {
        console.error("No current collection.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await createCollectionAction(projectId, currentCollection.id, collectionName);
    },
    [createCollectionAction, currentCollection, projectId]
  );

  const handleUpdateCollection = useCallback(
    async ({
      collectionId,
      update,
    }: {
      collectionId: string;
      update: Partial<{ name: string }>;
    }) => {
      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await updateCollectionAction(projectId, collectionId, update);
    },
    [updateCollectionAction, projectId]
  );

  const handleDeleteCollection = useCallback(
    async ({ collection }: { collection: Collection }) => {
      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await deleteCollectionAction(projectId, collection);
    },
    [deleteCollectionAction, projectId]
  );

  const handleAddToCollection = useCallback(
    async ({ entityId }: { entityId: string }) => {
      if (!entityId) {
        console.error("No entityId provided.");
        return;
      }

      if (!currentCollection) {
        console.error("No current collection.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await addToCollectionAction(projectId, currentCollection.id, entityId);
    },
    [addToCollectionAction, currentCollection, projectId]
  );

  const handleRemoveFromCollection = useCallback(
    async ({ entityId }: { entityId: string }) => {
      if (!currentCollection) {
        console.error("No current collection.");
        return;
      }

      if (!projectId) {
        console.error("No projectId available.");
        return;
      }

      await removeFromCollectionAction(projectId, currentCollection.id, entityId);
    },
    [removeFromCollectionAction, currentCollection, projectId]
  );

  // Return the same interface as the original hook
  return useMemo(
    () => ({
      currentCollection,
      subCollections,
      loading,

      openCollection,
      goBack,
      goToRoot,

      isEntityInCollection,

      createCollection: handleCreateCollection,
      updateCollection: handleUpdateCollection,
      deleteCollection: handleDeleteCollection,
      addToCollection: handleAddToCollection,
      removeFromCollection: handleRemoveFromCollection,
    }),
    [
      currentCollection,
      subCollections,
      loading,
      openCollection,
      goBack,
      goToRoot,
      isEntityInCollection,
      handleCreateCollection,
      handleUpdateCollection,
      handleDeleteCollection,
      handleAddToCollection,
      handleRemoveFromCollection,
    ]
  );
}

export default useCollections;