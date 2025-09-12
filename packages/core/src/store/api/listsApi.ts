import { baseApi } from "./baseApi";
import type { List } from "../../interfaces/models/List";

// API parameters types
interface FetchRootListParams {
  projectId: string;
}

interface FetchSubListsParams {
  projectId: string;
  listId: string;
}

interface CreateListParams {
  projectId: string;
  parentListId: string;
  listName: string;
}

interface UpdateListParams {
  projectId: string;
  listId: string;
  update: Partial<{ name: string }>;
}

interface DeleteListParams {
  projectId: string;
  listId: string;
}

interface AddToListParams {
  projectId: string;
  listId: string;
  entityId: string;
}

interface RemoveFromListParams {
  projectId: string;
  listId: string;
  entityId: string;
}

// Extended API with lists endpoints
export const listsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Fetch root list
    fetchRootList: builder.query<List, FetchRootListParams>({
      query: ({ projectId }) => ({
        url: `/${projectId}/lists/root`,
        method: "GET",
      }),
      providesTags: (result, error, { projectId }) => [
        { type: "List" as const, id: `${projectId}-ROOT` },
        ...(result ? [{ type: "List" as const, id: result.id }] : []),
      ],
    }),

    // Fetch sub-lists for a parent list
    fetchSubLists: builder.query<List[], FetchSubListsParams>({
      query: ({ projectId, listId }) => ({
        url: `/${projectId}/lists/${listId}/sub-lists`,
        method: "GET",
      }),
      providesTags: (result, error, { projectId, listId }) => [
        { type: "List" as const, id: `${projectId}-${listId}-SUBS` },
        ...(result?.map(({ id }) => ({
          type: "List" as const,
          id,
        })) ?? []),
      ],
    }),

    // Create a new sub-list
    createList: builder.mutation<List, CreateListParams>({
      query: ({ projectId, parentListId, listName }) => ({
        url: `/${projectId}/lists/${parentListId}/sub-lists`,
        method: "POST",
        body: { listName },
      }),
      invalidatesTags: (result, error, { projectId, parentListId }) => [
        { type: "List" as const, id: `${projectId}-${parentListId}-SUBS` },
        ...(result ? [{ type: "List" as const, id: result.id }] : []),
      ],
    }),

    // Update list properties
    updateList: builder.mutation<List, UpdateListParams>({
      query: ({ projectId, listId, update }) => ({
        url: `/${projectId}/lists/${listId}`,
        method: "PATCH",
        body: { update },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, listId, update },
        { dispatch, queryFulfilled }
      ) {
        // Update in all relevant queries
        const patches: any[] = [];

        // Update root list if it's the one being updated
        patches.push(
          dispatch(
            listsApi.util.updateQueryData(
              "fetchRootList",
              { projectId },
              (draft) => {
                if (draft && draft.id === listId) {
                  if (update.name !== undefined) {
                    draft.name = update.name;
                  }
                }
              }
            )
          )
        );

        // Update in sub-lists queries (we need to find which parent contains this list)
        // This is a simplified approach - in a real app you might want more sophisticated cache management
        try {
          await queryFulfilled;
        } catch {
          // Revert optimistic update on failure
          patches.forEach((patch) => patch.undo());
        }
      },
      invalidatesTags: (result, error, { listId }) => [
        { type: "List" as const, id: listId },
      ],
    }),

    // Delete a list
    deleteList: builder.mutation<void, DeleteListParams>({
      query: ({ projectId, listId }) => ({
        url: `/${projectId}/lists/${listId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { projectId, listId }) => [
        { type: "List" as const, id: listId },
        // Invalidate all sub-lists queries since we don't know which parent this belonged to
        { type: "List" as const, id: `${projectId}-SUBS-ALL` },
      ],
    }),

    // Add entity to list
    addToList: builder.mutation<List, AddToListParams>({
      query: ({ projectId, listId, entityId }) => ({
        url: `/${projectId}/lists/${listId}/add-entity`,
        method: "PATCH",
        body: { entityId },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, listId, entityId },
        { dispatch, queryFulfilled }
      ) {
        const patches: any[] = [];

        // Update root list if it's the target
        patches.push(
          dispatch(
            listsApi.util.updateQueryData(
              "fetchRootList",
              { projectId },
              (draft) => {
                if (draft && draft.id === listId) {
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
      invalidatesTags: (result, error, { listId }) => [
        { type: "List" as const, id: listId },
      ],
    }),

    // Remove entity from list
    removeFromList: builder.mutation<List, RemoveFromListParams>({
      query: ({ projectId, listId, entityId }) => ({
        url: `/${projectId}/lists/${listId}/remove-entity`,
        method: "PATCH",
        body: { entityId },
      }),
      // Optimistically update the cache
      async onQueryStarted(
        { projectId, listId, entityId },
        { dispatch, queryFulfilled }
      ) {
        const patches: any[] = [];

        // Update root list if it's the target
        patches.push(
          dispatch(
            listsApi.util.updateQueryData(
              "fetchRootList",
              { projectId },
              (draft) => {
                if (draft && draft.id === listId) {
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
      invalidatesTags: (result, error, { listId }) => [
        { type: "List" as const, id: listId },
      ],
    }),
  }),
});

// Export hooks for use in components
export const {
  useFetchRootListQuery,
  useLazyFetchRootListQuery,
  useFetchSubListsQuery,
  useLazyFetchSubListsQuery,
  useCreateListMutation,
  useUpdateListMutation,
  useDeleteListMutation,
  useAddToListMutation,
  useRemoveFromListMutation,
} = listsApi;

// Export for manual cache management
export const {
  fetchRootList,
  fetchSubLists,
  createList,
  updateList,
  deleteList,
  addToList,
  removeFromList,
} = listsApi.endpoints;