# Entity Lists Redux Guide

This guide explains how to use the new Redux-powered Entity Lists system in Replyke. Entity Lists have been migrated from React Context to Redux for better performance, global state management, and support for multiple concurrent feeds.

## Overview

The new system replaces `EntityListProvider` and `useEntityList`/`useEntityListData` with a single Redux-powered hook that can manage multiple independent entity feeds simultaneously.

## Quick Start

### Basic Setup

```tsx
import { useEntityListRedux } from '@replyke/core';

function FeedComponent() {
  const {
    entities,
    loading,
    hasMore,
    loadMore,
    fetchEntities
  } = useEntityListRedux({
    listId: "home-feed",
    limit: 20,  // Configure limit at hook level
    sourceId: "videos"  // Optional: stable source configuration
  });

  // Initialize the feed with filters
  useEffect(() => {
    fetchEntities({
      sortBy: "hot"
    });
  }, []);

  return (
    <div>
      {entities.map(entity => (
        <div key={entity.id}>{entity.title}</div>
      ))}

      {hasMore && (
        <button onClick={loadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
```

### Multiple Feeds

Each feed is completely independent and identified by a unique `listId`:

```tsx
function App() {
  return (
    <div>
      <HomeFeed />
      <SearchResults />
      <UserProfile userId="123" />
    </div>
  );
}

function HomeFeed() {
  const { entities, fetchEntities } = useEntityListRedux({
    listId: "home-feed"
  });

  useEffect(() => {
    fetchEntities({ sortBy: "hot", followedOnly: true });
  }, []);

  return <FeedDisplay entities={entities} />;
}

function SearchResults() {
  const { entities, fetchEntities } = useEntityListRedux({
    listId: "search-results"
  });

  const handleSearch = (query: string) => {
    fetchEntities({
      keywordsFilters: { includes: [query] }
    });
  };

  return <Searchablefeed entities={entities} onSearch={handleSearch} />;
}

function UserProfile({ userId }: { userId: string }) {
  const { entities, fetchEntities } = useEntityListRedux({
    listId: `profile-${userId}`
  });

  useEffect(() => {
    fetchEntities({ userId, sortBy: "recent" });
  }, [userId]);

  return <ProfileFeed entities={entities} />;
}
```

## API Reference

### `useEntityListRedux(props)`

**Props:**
```typescript
interface UseEntityListReduxProps {
  listId: string; // Required: unique identifier for this feed
  limit?: number; // Optional: entities per page (default: 10)
  sourceId?: string | null; // Optional: stable source configuration
  infuseData?: (foreignId: string) => Promise<Record<string, any> | null>;
}
```

**Returns:**
```typescript
interface UseEntityListReduxValues {
  // State
  entities: Entity[];
  infusedEntities: (Entity & Record<string, any>)[];
  loading: boolean;
  hasMore: boolean;

  // Current filters (read-only)
  sortBy: EntityListSortByOptions | null;
  timeFrame: TimeFrame | null;
  userId: string | null;
  followedOnly: boolean;
  keywordsFilters: KeywordsFilters | null;
  titleFilters: TitleFilters | null;
  contentFilters: ContentFilters | null;
  attachmentsFilters: AttachmentsFilters | null;
  locationFilters: LocationFilters | null;
  metadataFilters: MetadataFilters | null;

  // Actions
  fetchEntities: (
    filters: Partial<FilterOptions>, // Note: limit is not included here
    options?: { resetUnspecified?: boolean; immediate?: boolean }
  ) => void;
  loadMore: () => void;
  createEntity: (props) => Promise<Entity | undefined>;
  deleteEntity: (props) => Promise<void>;
  setEntities: React.Dispatch<React.SetStateAction<Entity[]>>; // Legacy compatibility
}
```

## Key Features

### 1. Fetch-on-Demand

The `fetchEntities()` function accepts any combination of filters and always triggers a fresh data fetch:

```tsx
// ✅ Always fetches: Initialize with defaults
fetchEntities({});

// ✅ Always fetches: Multiple filter changes in one call
fetchEntities({
  sortBy: "recent",
  timeFrame: "week",
  followedOnly: true
});

// ✅ Always fetches: Reset unspecified filters to defaults
fetchEntities({ sortBy: "recent" }, { resetUnspecified: true });
```

### 2. Automatic Debounced Fetching

Each call to `fetchEntities()` is automatically debounced (800ms):

```tsx
const { fetchEntities } = useEntityListRedux({ listId: "feed" });

// This will trigger ONE API call after 800ms, even if called multiple times
fetchEntities({ sortBy: "hot" });
fetchEntities({ timeFrame: "week" });  // Cancels previous, starts new 800ms timer

// For immediate execution (bypasses debouncing)
fetchEntities({ sortBy: "recent" }, { immediate: true });
```

**Note:** Use `immediate: true` sparingly - the debouncing prevents excessive API calls and improves performance. Immediate execution is useful for user-initiated refresh actions where instant feedback is expected.

### 3. Independent Feed Management

Each `listId` maintains completely separate state:

```tsx
// These are completely independent feeds
const homeFeed = useEntityListRedux({ listId: "home" });
const searchFeed = useEntityListRedux({ listId: "search" });

homeFeed.fetchEntities({ sortBy: "hot" });     // Only affects home feed
searchFeed.fetchEntities({ sortBy: "recent" }); // Only affects search feed
```

### 4. Keyword Management

For complex keyword operations, use the provided helper utilities:

```tsx
import { useEntityListRedux, keywordHelpers } from '@replyke/core';

function SearchFeed() {
  const { fetchEntities, keywordsFilters } = useEntityListRedux({
    listId: "search-feed"
  });

  const addKeyword = (keyword: string) => {
    fetchEntities({
      keywordsFilters: keywordHelpers.addKeywords(keywordsFilters, "includes", [keyword])
    });
  };

  const removeKeyword = (keyword: string) => {
    fetchEntities({
      keywordsFilters: keywordHelpers.removeKeywords(keywordsFilters, "includes", [keyword])
    });
  };

  const clearAllKeywords = () => {
    fetchEntities({
      keywordsFilters: keywordHelpers.resetAllKeywords()
    });
  };
}
```

### 5. Memory Management

Feeds are automatically cleaned up when not accessed for extended periods. You can also manually clean up:

```tsx
// Feeds are automatically garbage collected when unused
// No manual cleanup needed in most cases
```

## Common Patterns

### 1. Search Feed

```tsx
function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const {
    entities,
    loading,
    fetchEntities
  } = useEntityListRedux({ listId: "search-results" });

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    fetchEntities({
      keywordsFilters: query ? { includes: [query] } : null,
      sortBy: "recent"
    });
  }, [fetchEntities]);

  return (
    <div>
      <SearchInput onSearch={handleSearch} />
      <SearchResults entities={entities} loading={loading} />
    </div>
  );
}
```

### 2. Filtered User Feed

```tsx
function UserProfileFeed({ userId }: { userId: string }) {
  const {
    entities,
    loading,
    hasMore,
    loadMore,
    fetchEntities
  } = useEntityListRedux({
    listId: `user-${userId}`,
    limit: 15  // Configure at hook level
  });

  useEffect(() => {
    fetchEntities({
      userId,
      sortBy: "recent"
    });
  }, [userId, fetchEntities]);

  return (
    <InfiniteScroll
      dataLength={entities.length}
      next={loadMore}
      hasMore={hasMore}
      loader={<div>Loading...</div>}
    >
      {entities.map(entity => (
        <EntityCard key={entity.id} entity={entity} />
      ))}
    </InfiniteScroll>
  );
}
```

### 3. Real-time Feed with CRUD

```tsx
function LiveFeed() {
  const {
    entities,
    createEntity,
    deleteEntity,
    fetchEntities
  } = useEntityListRedux({
    listId: "live-feed",
    limit: 20
  });

  useEffect(() => {
    fetchEntities({ sortBy: "recent" });
  }, []);

  const handleCreatePost = async (postData: any) => {
    const newEntity = await createEntity({
      title: postData.title,
      content: postData.content,
      insertPosition: "first" // Add to top of feed
    });

    // Entity automatically appears in feed
  };

  const handleDeletePost = async (entityId: string) => {
    await deleteEntity({ entityId });
    // Entity automatically removed from feed
  };

  return (
    <div>
      <CreatePostForm onSubmit={handleCreatePost} />
      {entities.map(entity => (
        <PostCard
          key={entity.id}
          entity={entity}
          onDelete={() => handleDeletePost(entity.id)}
        />
      ))}
    </div>
  );
}
```

### 4. Advanced Filtering

```tsx
import { useEntityListRedux, keywordHelpers } from '@replyke/core';

function AdvancedFilteredFeed() {
  const {
    entities,
    sortBy,
    timeFrame,
    followedOnly,
    keywordsFilters,
    fetchEntities
  } = useEntityListRedux({ listId: "filtered-feed" });

  const handleFilterChange = (newFilters: any) => {
    fetchEntities({
      sortBy: newFilters.sortBy,
      timeFrame: newFilters.timeFrame,
      followedOnly: newFilters.followedOnly,
      locationFilters: newFilters.location ? {
        latitude: newFilters.location.lat,
        longitude: newFilters.location.lng,
        radius: newFilters.location.radius
      } : null
    });
  };

  const addKeyword = (keyword: string) => {
    fetchEntities({
      keywordsFilters: keywordHelpers.addKeywords(keywordsFilters, "includes", [keyword])
    });
  };

  const removeKeyword = (keyword: string) => {
    fetchEntities({
      keywordsFilters: keywordHelpers.removeKeywords(keywordsFilters, "includes", [keyword])
    });
  };

  return (
    <div>
      <FilterControls
        currentFilters={{ sortBy, timeFrame, followedOnly }}
        onChange={handleFilterChange}
      />
      <KeywordTags
        onAdd={addKeyword}
        onRemove={removeKeyword}
      />
      <EntityGrid entities={entities} />
    </div>
  );
}
```

## Migration from Context-based System

### Before (Context-based)

```tsx
// Old way - no longer available
function OldFeedComponent() {
  return (
    <EntityListProvider sortBy="hot" limit={20} followedOnly={true}>
      <FeedContent />
    </EntityListProvider>
  );
}

function FeedContent() {
  const {
    entities,
    loadMore,
    setSortBy,
    setTimeFrame
  } = useEntityList();

  // Multiple separate calls would trigger multiple fetches
  setSortBy("recent");
  setTimeFrame("week");

  return <div>{/* render entities */}</div>;
}
```

### After (Redux-based)

```tsx
// New way
function NewFeedComponent() {
  const {
    entities,
    loadMore,
    fetchEntities
  } = useEntityListRedux({
    listId: "my-feed",
    limit: 20  // Configure at hook level
  });

  useEffect(() => {
    // Single unified call
    fetchEntities({
      sortBy: "hot",
      followedOnly: true
    });
  }, []);

  const handleTimeframeChange = (timeFrame: TimeFrame) => {
    fetchEntities({ timeFrame });
  };

  return <div>{/* render entities */}</div>;
}
```

## Best Practices

### 1. Unique List IDs

Use descriptive, unique `listId` values:

```tsx
// ✅ Good: Descriptive and unique
useEntityListRedux({ listId: "home-feed" });
useEntityListRedux({ listId: "search-results" });
useEntityListRedux({ listId: `user-profile-${userId}` });
useEntityListRedux({ listId: "reddit-feed", sourceId: "reddit" });

// ❌ Avoid: Generic or conflicting IDs
useEntityListRedux({ listId: "feed" });        // Too generic
useEntityListRedux({ listId: "list" });        // Too generic
useEntityListRedux({ listId: "entities" });    // Too generic
```

### 2. Initialize Filters Early

Set up your filters immediately to start fetching data:

```tsx
function MyFeed() {
  const { fetchEntities } = useEntityListRedux({
    listId: "my-feed",
    limit: 20
  });

  useEffect(() => {
    // Initialize immediately
    fetchEntities({
      sortBy: "hot",
      timeFrame: "week"
    });
  }, []); // Empty deps = run once on mount

  // Component renders with data
}
```

### 3. Batch Filter Updates

Combine multiple filter changes into a single call:

```tsx
// ✅ Good: Single API call
const applyFilters = useCallback((userPreferences: any) => {
  fetchEntities({
    sortBy: userPreferences.sortBy,
    timeFrame: userPreferences.timeFrame,
    followedOnly: userPreferences.followedOnly,
    keywordsFilters: userPreferences.keywords?.length ?
      { includes: userPreferences.keywords } : null
  });
}, [fetchEntities]);

// ❌ Avoid: Multiple API calls (each triggers separate fetch)
const applyFiltersSlowly = (userPreferences: any) => {
  fetchEntities({ sortBy: userPreferences.sortBy });
  fetchEntities({ timeFrame: userPreferences.timeFrame });
  fetchEntities({ followedOnly: userPreferences.followedOnly });
};
```

### 4. Handle Loading States

Always handle loading and error states appropriately:

```tsx
function RobustFeed() {
  const {
    entities,
    loading,
    hasMore,
    loadMore
  } = useEntityListRedux({ listId: "robust-feed" });

  return (
    <div>
      {entities.length === 0 && !loading ? (
        <div>No entities found</div>
      ) : (
        entities.map(entity => (
          <EntityCard key={entity.id} entity={entity} />
        ))
      )}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loading}
          className={loading ? "loading" : ""}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}
    </div>
  );
}
```

## Troubleshooting

### Issue: sourceId moved to hook configuration

**Background:** `sourceId` has been moved from dynamic filters to stable hook configuration for better semantics and to prevent errors when creating entities.

**Migration:**
```tsx
// ❌ Old way - sourceId as dynamic filter
const { fetchEntities, createEntity } = useEntityListRedux({
  listId: "my-feed"
});

fetchEntities({ sourceId: "reddit", sortBy: "hot" });

await createEntity({
  title: "My Post",
  sourceId: "reddit"  // Could accidentally use wrong sourceId
});

// ✅ New way - sourceId as stable hook configuration
const { fetchEntities, createEntity } = useEntityListRedux({
  listId: "my-feed",
  sourceId: "reddit"  // Set once at hook level
});

fetchEntities({ sortBy: "hot" }); // sourceId automatically used

await createEntity({
  title: "My Post"
  // sourceId automatically inherited from hook config
});
```

### Issue: Replacing resetEntities calls

**Background:** The `resetEntities` function has been removed in favor of using `fetchEntities({})` for better consistency.

**Migration:**
```tsx
// ❌ Old way (no longer available)
await resetEntities();

// ✅ New way - refetch with current filters
fetchEntities({});

// ✅ New way - refetch immediately (bypasses debouncing)
fetchEntities({}, { immediate: true });
```

### Issue: No data loading

**Cause:** Filters not initialized

**Solution:**
```tsx
// Make sure to call fetchEntities to start fetching
useEffect(() => {
  fetchEntities({ sortBy: "hot" });
}, []);
```

### Issue: Multiple API calls on filter changes

**Cause:** Separate filter calls instead of batched

**Solution:**
```tsx
// ❌ Causes multiple API calls (each triggers separate fetch)
fetchEntities({ sortBy: "recent" });
fetchEntities({ timeFrame: "week" });

// ✅ Single API call (batched filters)
fetchEntities({ sortBy: "recent", timeFrame: "week" });
```

### Issue: Conflicting data between feeds

**Cause:** Same `listId` used for different feeds

**Solution:**
```tsx
// Ensure unique listId for each feed
const homeFeed = useEntityListRedux({ listId: "home-feed" });
const searchFeed = useEntityListRedux({ listId: "search-results" });
```

### Issue: Memory usage concerns

**Cause:** Many feeds created without cleanup

**Solution:** The system automatically cleans up unused feeds. For manual control:
```tsx
// Feeds are automatically garbage collected
// Use specific, descriptive listIds and avoid creating too many unique feeds
```

## Redux DevTools

You can inspect Entity Lists state in Redux DevTools:

```
State → entityLists → lists
├── "home-feed": {
│   ├── entities: [...]
│   ├── loading: false
│   ├── hasMore: true
│   ├── sortBy: "hot"
│   ├── filters: {...}
│   └── ...
│ }
├── "search-results": {
│   ├── entities: [...]
│   └── ...
│ }
└── ...
```

**Useful actions to watch:**
- `entityLists/updateFiltersAndSort` - Filter changes (from fetchEntities calls)
- `entityLists/setEntityListEntities` - Data loaded
- `entityLists/addEntity` - Entity created
- `entityLists/removeEntity` - Entity deleted

## Performance Notes

The Redux-powered Entity Lists system provides several performance benefits:

1. **Global State**: Multiple components can access the same feed data without prop drilling
2. **Smart Caching**: Feed data persists across component unmounts
3. **Debounced Updates**: Filter changes are debounced to prevent excessive API calls
4. **Optimistic Updates**: CRUD operations update the UI immediately with automatic rollback on failure
5. **Memory Management**: Automatic cleanup of unused feeds

The system maintains the same developer experience as the previous Context-based approach while providing better performance and flexibility for complex applications.