export type SortDirection = "asc" | "desc";

export type EntityListSortByOptions =
  | "top"
  | "hot"
  | "new"
  | "controversial"
  | `metadata.${string}`;

/**
 * Validates a metadata property name for sorting.
 * Metadata property names must contain only alphanumeric characters and underscores.
 *
 * @param propertyName - The property name to validate (without the "metadata." prefix)
 * @throws Error if the property name contains invalid characters
 */
export function validateMetadataPropertyName(propertyName: string): void {
  if (!/^[a-zA-Z0-9_]+$/.test(propertyName)) {
    throw new Error(
      `Invalid metadata property name: '${propertyName}'. Only alphanumeric characters and underscores are allowed.`
    );
  }
}

/**
 * Validates a sortBy value, checking metadata property names if applicable.
 *
 * @param sortBy - The sortBy value to validate
 * @throws Error if sortBy uses metadata pattern with invalid property name
 */
export function validateSortBy(sortBy: string): void {
  if (sortBy.startsWith("metadata.")) {
    const propertyName = sortBy.substring(9); // Remove "metadata." prefix
    if (propertyName.length === 0) {
      throw new Error(
        "Invalid metadata sort: property name cannot be empty after 'metadata.'"
      );
    }
    validateMetadataPropertyName(propertyName);
  }
}
