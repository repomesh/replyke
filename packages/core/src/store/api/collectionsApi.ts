import { baseApi } from "./baseApi";
import type { Collection } from "../../interfaces/models/Collection";

// API parameters types
interface FetchRootCollectionParams {
  projectId: string;
}

interface FetchSubCollectionsParams {
  projectId: string;
  collectionId: string;
}

interface CreateCollectionParams {
  projectId: string;
  parentCollectionId: string;
  collectionName: string;
}

interface UpdateCollectionParams {
  projectId: string;
  collectionId: string;
  update: Partial<{ name: string }>;
}

interface DeleteCollectionParams {
  projectId: string;
  collectionId: string;
}

interface AddToCollectionParams {
  projectId: string;
  collectionId: string;
  entityId: string;
}

interface RemoveFromCollectionParams {
  projectId: string;
  collectionId: string;
  entityId: string;
}

// Extended API with collections endpoints
export const collectionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch root collection
    fetchRootCollection: builder.query<Collection, FetchRootCollectionParams>({
      query: ({ projectId }) => ({
        url: `/${projectId}/collections/root`,
        method: "GET",
      }),
      providesTags: (result, error, { projectId }) => [
        { type: "Collection" as const, id: `${projectId}-ROOT` },
        ...(result ? [{ type: "Collection" as const, id: result.id }] : []),
      ],
    }),

    // Fetch sub-collections for a parent collection
    fetchSubCollections: builder.query<Collection[], FetchSubCollectionsParams>({
      query: ({ projectId, collectionId }) => ({
        url: `/${projectId}/collections/${collectionId}/sub-collections`,
        method: "GET",
      }),
      providesTags: (result, error, { projectId, collectionId }) => [
        { type: "Collection" as const, id: `${projectId}-${collectionId}-SUBS` },
        ...(result?.map(({ id }) => ({
          type: "Collection" as const,
          id,
        })) ?? []),
      ],
    }),

    // Create a new sub-collection
    createCollection: builder.mutation<Collection, CreateCollectionParams>({
      query: ({ projectId, parentCollectionId, collectionName }) => ({
        url: `/${projectId}/collections/${parentCollectionId}/sub-collections`,
        method: "POST",
        body: { collectionName },
      }),
      invalidatesTags: (result, error, { projectId, parentCollectionId }) => [
        { type: "Collection" as const, id: `${projectId}-${parentCollectionId}-SUBS` },
        ...(result ? [{ type: "Collection" as const, id: result.id }] : []),
      ],
    }),

    // Update collection properties
    updateCollection: builder.mutation<Collection, UpdateCollectionParams>({
      query: ({ projectId, collectionId, update }) => ({
        url: `/${projectId}/collections/${collectionId}`,
        method: "PATCH",
        body: { update },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, collectionId, update },
        { dispatch, queryFulfilled }
      ) {
        // Update in all relevant queries
        const patches: any[] = [];

        // Update root collection if it's the one being updated
        patches.push(
          dispatch(
            collectionsApi.util.updateQueryData(
              "fetchRootCollection",
              { projectId },
              (draft) => {
                if (draft && draft.id === collectionId) {
                  if (update.name !== undefined) {
                    draft.name = update.name;
                  }
                }
              }
            )
          )
        );

        // Update in sub-collections queries (we need to find which parent contains this collection)
        // This is a simplified approach - in a real app you might want more sophisticated cache management
        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, { collectionId }) => [
        { type: "Collection" as const, id: collectionId },
      ],
    }),

    // Delete a collection
    deleteCollection: builder.mutation<void, DeleteCollectionParams>({
      query: ({ projectId, collectionId }) => ({
        url: `/${projectId}/collections/${collectionId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId, collectionId }) => [
        { type: "Collection" as const, id: collectionId },
        // Invalidate all sub-collections queries since we don't know which parent this belonged to
        { type: "Collection" as const, id: `${projectId}-SUBS-ALL` },
      ],
    }),

    // Add entity to collection
    addToCollection: builder.mutation<Collection, AddToCollectionParams>({
      query: ({ projectId, collectionId, entityId }) => ({
        url: `/${projectId}/collections/${collectionId}/add-entity`,
        method: "PATCH",
        body: { entityId },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, collectionId, entityId },
        { dispatch, queryFulfilled }
      ) {
        const patches: any[] = [];

        // Update root collection if it's the target
        patches.push(
          dispatch(
            collectionsApi.util.updateQueryData(
              "fetchRootCollection",
              { projectId },
              (draft) => {
                if (draft && draft.id === collectionId) {
                  if (!draft.entityIds.includes(entityId)) {
                    draft.entityIds.push(entityId);
                  }
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, { collectionId }) => [
        { type: "Collection" as const, id: collectionId },
      ],
    }),

    // Remove entity from collection
    removeFromCollection: builder.mutation<Collection, RemoveFromCollectionParams>({
      query: ({ projectId, collectionId, entityId }) => ({
        url: `/${projectId}/collections/${collectionId}/remove-entity`,
        method: "PATCH",
        body: { entityId },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, collectionId, entityId },
        { dispatch, queryFulfilled }
      ) {
        const patches: any[] = [];

        // Update root collection if it's the target
        patches.push(
          dispatch(
            collectionsApi.util.updateQueryData(
              "fetchRootCollection",
              { projectId },
              (draft) => {
                if (draft && draft.id === collectionId) {
                  draft.entityIds = draft.entityIds.filter(id => id !== entityId);
                }
              }
            )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, { collectionId }) => [
        { type: "Collection" as const, id: collectionId },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useFetchRootCollectionQuery,
  useLazyFetchRootCollectionQuery,
  useFetchSubCollectionsQuery,
  useLazyFetchSubCollectionsQuery,
  useCreateCollectionMutation,
  useUpdateCollectionMutation,
  useDeleteCollectionMutation,
  useAddToCollectionMutation,
  useRemoveFromCollectionMutation,
} = collectionsApi;

// Export for manual cache management
export const {
  fetchRootCollection,
  fetchSubCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addToCollection,
  removeFromCollection,
} = collectionsApi.endpoints;