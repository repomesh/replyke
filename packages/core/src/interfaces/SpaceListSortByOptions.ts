export type SpaceListSortByOptions = "newest" | "members" | "alphabetical";

export interface SpaceListFilters {
  search?: string | null;
  visibility?: "public" | "private" | null;
  memberOf?: boolean;
  parentSpaceId?: string | null; // "null" string for root spaces, UUID for children
}
