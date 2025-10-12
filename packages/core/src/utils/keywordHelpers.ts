import { KeywordsFilters } from "../interfaces/entity-filters/KeywordsFilters";

/**
 * Helper utilities for managing keywords filters in entity lists
 */
export const keywordHelpers = {
  /**
   * Add keywords to a specific filter type
   */
  addKeywords: (
    current: KeywordsFilters | null,
    type: "includes" | "doesNotInclude",
    values: string[]
  ): KeywordsFilters => {
    const existing = current || {};
    return {
      ...existing,
      [type]: Array.from(new Set([...(existing[type] || []), ...values])),
    };
  },

  /**
   * Remove keywords from a specific filter type
   */
  removeKeywords: (
    current: KeywordsFilters | null,
    type: "includes" | "doesNotInclude",
    values: string[]
  ): KeywordsFilters | null => {
    if (!current) return null;

    const updated = {
      ...current,
      [type]: (current[type] || []).filter((item) => !values.includes(item)),
    };

    // Return null if both arrays are empty
    if (
      (!updated.includes || updated.includes.length === 0) &&
      (!updated.doesNotInclude || updated.doesNotInclude.length === 0)
    ) {
      return null;
    }

    return updated;
  },

  /**
   * Remove keywords from both filter types
   */
  removeKeywordsFromBoth: (
    current: KeywordsFilters | null,
    values: string[]
  ): KeywordsFilters | null => {
    if (!current) return null;

    const updated = {
      includes: (current.includes || []).filter(
        (item) => !values.includes(item)
      ),
      doesNotInclude: (current.doesNotInclude || []).filter(
        (item) => !values.includes(item)
      ),
    };

    // Return null if both arrays are empty
    if (updated.includes.length === 0 && updated.doesNotInclude.length === 0) {
      return null;
    }

    return updated;
  },

  /**
   * Reset keywords for a specific filter type
   */
  resetKeywords: (
    current: KeywordsFilters | null,
    type: "includes" | "doesNotInclude"
  ): KeywordsFilters | null => {
    if (!current) return null;

    const updated = {
      ...current,
      [type]: undefined,
    };

    // Return null if both arrays are empty/undefined
    if (!updated.includes && !updated.doesNotInclude) {
      return null;
    }

    return updated;
  },

  /**
   * Reset all keywords filters
   */
  resetAllKeywords: (): null => {
    return null;
  },

  /**
   * Replace keywords for a specific filter type
   */
  replaceKeywords: (
    current: KeywordsFilters | null,
    type: "includes" | "doesNotInclude",
    values: string[]
  ): KeywordsFilters | null => {
    const existing = current || {};
    const updated = {
      ...existing,
      [type]: values.length > 0 ? values : undefined,
    };

    // Return null if both arrays are empty/undefined
    if (!updated.includes && !updated.doesNotInclude) {
      return null;
    }

    return updated;
  },
};