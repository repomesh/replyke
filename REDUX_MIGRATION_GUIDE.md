# Redux Migration Guide

This guide explains how to migrate from Context-based state management to Redux Toolkit for app notifications and lists functionality in the Replyke framework.

## Overview

We've implemented Redux Toolkit alongside the existing Context system to provide better state management for complex scenarios. Both systems work identically from the consumer's perspective.

## Quick Start

### Single Provider Setup (Recommended)

```tsx
// Before (Context only)
<ReplykeProvider projectId="your-project-id" signedToken={token}>
  <YourApp />
</ReplykeProvider>

// After (Context + Redux)
<ReplykeProvider projectId="your-project-id" signedToken={token} enableRedux>
  <YourApp />
</ReplykeProvider>
```

### Using Redux-powered Hooks

```tsx
// Context version
import { useAppNotificationsData } from '@replyke/core';

function NotificationsComponent() {
  const {
    appNotifications,
    unreadAppNotificationsCount,
    loading,
    hasMore,
    loadMore,
    markNotificationAsRead,
    resetAppNotifications
  } = useAppNotificationsData({
    limit: 20,
    notificationTemplates: {
      entityComment: {
        title: "$userName commented on your post",
        content: "$commentContent"
      }
    }
  });

  return (
    <div>
      {/* Your notification UI */}
    </div>
  );
}
```

```tsx
// Redux version (identical API)
import { useAppNotificationsDataRedux } from '@replyke/core';

function NotificationsComponent() {
  const {
    appNotifications,
    unreadAppNotificationsCount,
    loading,
    hasMore,
    loadMore,
    markNotificationAsRead,
    resetAppNotifications
  } = useAppNotificationsDataRedux({
    limit: 20,
    notificationTemplates: {
      entityComment: {
        title: "$userName commented on your post",
        content: "$commentContent"
      }
    }
  });

  return (
    <div>
      {/* Identical UI code */}
    </div>
  );
}
```

## Lists Management

### Using Redux-powered Lists

The lists system has been fully migrated to Redux. The new hooks provide identical functionality to the original context-based system.

```tsx
// Context version (legacy - no longer exported)
import { useListsData, useLists } from '@replyke/core';

function ListsComponent() {
  const {
    currentList,
    subLists,
    loading,
    openList,
    goBack,
    goToRoot,
    isEntityInList,
    createList,
    updateList,
    deleteList,
    addToList,
    removeFromList
  } = useListsData();

  const handleCreateNewList = async () => {
    await createList({ listName: "My New List" });
  };

  const handleAddEntity = async (entityId: string) => {
    await addToList({ entityId });
  };

  return (
    <div>
      {currentList && (
        <div>
          <h2>{currentList.name}</h2>
          <button onClick={goBack}>Back</button>
          <button onClick={goToRoot}>Go to Root</button>
        </div>
      )}
      
      <div>
        {subLists.map(list => (
          <div key={list.id} onClick={() => openList(list)}>
            {list.name} ({list.entityIds.length} items)
          </div>
        ))}
      </div>
    </div>
  );
}
```

```tsx
// Redux version (identical API)
import { useListsDataRedux, useListsRedux } from '@replyke/core';

function ListsComponent() {
  const {
    currentList,
    subLists,
    loading,
    openList,
    goBack,
    goToRoot,
    isEntityInList,
    createList,
    updateList,
    deleteList,
    addToList,
    removeFromList
  } = useListsDataRedux();

  const handleCreateNewList = async () => {
    await createList({ listName: "My New List" });
  };

  const handleAddEntity = async (entityId: string) => {
    await addToList({ entityId });
  };

  return (
    <div>
      {/* Identical UI code - same functionality */}
      {currentList && (
        <div>
          <h2>{currentList.name}</h2>
          <button onClick={goBack}>Back</button>
          <button onClick={goToRoot}>Go to Root</button>
        </div>
      )}
      
      <div>
        {subLists.map(list => (
          <div key={list.id} onClick={() => openList(list)}>
            {list.name} ({list.entityIds.length} items)
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Lists Features

The Redux-powered lists system includes all original functionality:

**Navigation:**
- Hierarchical list navigation with history stack
- `openList(list)` - Navigate to a sub-list
- `goBack()` - Return to previous list in history
- `goToRoot()` - Jump to the root list

**CRUD Operations:**
- `createList({ listName })` - Create a new sub-list under current list
- `updateList({ listId, update })` - Update list properties (name, etc.)
- `deleteList({ list })` - Delete a list and handle navigation
- `addToList({ entityId })` - Add an entity to the current list
- `removeFromList({ entityId })` - Remove an entity from current list

**State & Utilities:**
- `currentList` - Currently active list
- `subLists` - Sub-lists of the current list
- `loading` - Loading state for operations
- `isEntityInList(entityId)` - Check if entity is in current list

**Caching & Performance:**
- Smart caching of sub-lists by parent ID
- Optimistic updates for instant UI feedback
- Automatic cache invalidation and updates

## Architecture

### Provider Chain
```
ReplykeProvider (project context)
  └── AuthProvider (user context)
      └── ReplykeStoreProvider (Redux store - when enableRedux=true)
          └── Your App
```

This ensures Redux has access to project and user context for API calls.

### Data Flow

**Context Flow:**
1. Component calls `useAppNotificationsData({ templates })`
2. Hook stores templates in local state
3. Hook makes API calls using project/user context
4. Raw notifications are processed by `addNotificationsMessages()`
5. Component receives templated notifications

**Redux Flow:**
1. Component calls `useAppNotificationsDataRedux({ templates })`
2. Hook stores templates in Redux state via dispatch
3. RTK Query makes API calls using project/user context
4. Raw notifications are processed by `addNotificationsMessages()`
5. Component receives templated notifications via Redux selectors

## Template System

Templates work identically in both systems:

```tsx
const notificationTemplates = {
  entityComment: {
    title: "$userName commented on your post \"$entityTitle\"",
    content: "$commentContent"
  },
  commentReply: {
    title: "$userName replied to your comment",
    content: "$replyContent"
  },
  entityUpvote: {
    title: "$userName upvoted your post",
    content: ""
  }
};

// Available template variables:
// $userName - Initiator's display name
// $userUsername - Initiator's username
// $entityTitle - Entity title
// $entityContent - Entity content
// $commentContent - Comment content
// $replyContent - Reply content
```

## API Reference

### Hooks

#### `useAppNotificationsDataRedux(props)`
Redux-powered replacement for `useAppNotificationsData`.

**Props:**
- `limit?: number` - Number of notifications per page (default: 10)
- `notificationTemplates?: Partial<NotificationTemplates>` - Custom templates

**Returns:**
- `appNotifications: UnifiedAppNotification[]` - Array of notifications
- `unreadAppNotificationsCount: number` - Count of unread notifications
- `loading: boolean` - Loading state
- `hasMore: boolean` - Whether more notifications are available
- `loadMore: () => void` - Load next page
- `markNotificationAsRead: (id: string) => Promise<void>` - Mark notification as read
- `resetAppNotifications: () => Promise<void>` - Reset and reload notifications

#### `useAppNotificationsRedux()`
Redux-powered replacement for `useAppNotifications`.

Returns the same data as above but without configuration props.

#### `useListsDataRedux()`
Redux-powered replacement for `useListsData`.

**Props:**
None - automatically uses project context and user authentication.

**Returns:**
- `currentList: List | null` - Currently active list
- `subLists: List[]` - Sub-lists of the current list  
- `loading: boolean` - Loading state for operations
- `openList: (list: List) => void` - Navigate to a sub-list
- `goBack: () => void` - Return to previous list in navigation history
- `goToRoot: () => void` - Jump back to the root list
- `isEntityInList: (entityId: string) => boolean` - Check if entity is in current list
- `createList: (props: { listName: string }) => Promise<void>` - Create new sub-list
- `updateList: (props: { listId: string; update: Partial<{ name: string }> }) => Promise<void>` - Update list properties
- `deleteList: (props: { list: List }) => Promise<void>` - Delete a list
- `addToList: (props: { entityId: string }) => Promise<void>` - Add entity to current list
- `removeFromList: (props: { entityId: string }) => Promise<void>` - Remove entity from current list

#### `useListsRedux()`
Redux-powered replacement for `useLists`.

Returns basic lists state without CRUD operations:
- `currentList: List | null` - Currently active list
- `subLists: List[]` - Sub-lists of the current list
- `loading: boolean` - Loading state
- `openList: (list: List) => void` - Navigate to a sub-list
- `goBack: () => void` - Return to previous list
- `goToRoot: () => void` - Jump to root list

#### `useListsActionsRedux()`
Advanced hook providing all lists actions for complex scenarios.

Returns all CRUD operations and navigation functions. Useful when you need actions without state subscriptions.

### Providers

#### `ReplykeProvider`
Main provider with optional Redux support.

**Props:**
- `projectId: string` - Your Replyke project ID
- `signedToken?: string` - Authentication token
- `enableRedux?: boolean` - Enable Redux store (default: false)
- `children: ReactNode` - Your app components

## Migration Strategies

### 1. Gradual Migration (Recommended)

Run both systems in parallel during migration:

```tsx
function NotificationsList() {
  // Test both implementations
  const contextData = useAppNotificationsData({ limit: 10 });
  const reduxData = useAppNotificationsDataRedux({ limit: 10 });

  // Use Redux data, but log comparison for validation
  useEffect(() => {
    console.log('Context notifications:', contextData.appNotifications.length);
    console.log('Redux notifications:', reduxData.appNotifications.length);
  }, [contextData.appNotifications, reduxData.appNotifications]);

  return <div>{/* Use reduxData */}</div>;
}
```

### 2. Component-by-Component

Migrate individual components:

```tsx
// Leave existing components using Context
function OldNotificationBadge() {
  const { unreadAppNotificationsCount } = useAppNotifications();
  return <Badge count={unreadAppNotificationsCount} />;
}

// New components use Redux
function NewNotificationsList() {
  const { appNotifications } = useAppNotificationsRedux();
  return <List items={appNotifications} />;
}
```

### 3. Feature Flag Approach

```tsx
const USE_REDUX = process.env.REACT_APP_USE_REDUX === 'true';

function NotificationComponent() {
  const data = USE_REDUX 
    ? useAppNotificationsDataRedux({ limit: 20 })
    : useAppNotificationsData({ limit: 20 });
  
  return <div>{/* Same UI code */}</div>;
}
```

### 4. Lists Migration (Already Complete)

**⚠️ Important**: The lists functionality has been fully migrated to Redux. The old context-based hooks are no longer exported and should be replaced:

```tsx
// ❌ Old way (no longer available)
import { useListsData, useLists } from '@replyke/core';

// ✅ New way (Redux-powered)
import { useListsDataRedux, useListsRedux } from '@replyke/core';

function ListManager() {
  // Simply replace the hook - API is identical
  const {
    currentList,
    subLists,
    loading,
    createList,
    addToList,
    // ... all other functions work the same
  } = useListsDataRedux(); // <- Just add "Redux" suffix

  // All your existing code works unchanged!
  const handleAddToList = async (entityId: string) => {
    await addToList({ entityId });
  };

  return (
    <div>
      {/* Same UI code as before */}
    </div>
  );
}
```

**Migration Steps:**
1. Find and replace `useListsData` → `useListsDataRedux`
2. Find and replace `useLists` → `useListsRedux`  
3. Update imports to use the new hook names
4. Test functionality - everything should work identically

**No Provider Changes Needed** - Lists work automatically with `enableRedux={true}` on `ReplykeProvider`.

## Troubleshooting

### Common Issues

**1. "Cannot find module 'react-redux'"**
```bash
npm install react-redux @reduxjs/toolkit
```

**2. "useAppNotificationsDataRedux returns empty data"**
- Ensure `enableRedux={true}` is set on `ReplykeProvider`
- Check Redux DevTools for state updates
- Verify project ID and authentication are working

**3. "Templates not applying to notifications"**
- Templates are passed as props, not global configuration
- Verify template syntax uses `$variableName` format
- Check that `addNotificationsMessages` is being called

**4. "Redux store not receiving project context"**
- Redux store must be inside `ReplykeProvider` → `AuthProvider` chain
- Use `enableRedux` prop instead of manual `ReplykeStoreProvider`

**5. "Maximum update depth exceeded" with notificationTemplates**
- This was caused by infinite re-renders from object reference comparison
- **Fixed in v5.1.5-beta.1+** - Uses deep comparison to prevent infinite loops
- **Workaround for older versions**: Memoize your templates object:
```tsx
const templates = useMemo(() => ({
  entityUpvote: { title: "...", content: "..." }
}), []); // ✅ Stable reference
```

**6. "Cannot find module useListsData"**
- Old hooks `useListsData`, `useLists` are no longer exported
- Replace with `useListsDataRedux`, `useListsRedux` from `@replyke/core`
- API is 100% identical - just add "Redux" suffix

**7. "useListsDataRedux returns null currentList"**
- Ensure user is authenticated (lists require user context)
- Check Redux DevTools: `lists.currentList` should populate after login
- Verify project ID is set correctly on `ReplykeProvider`
- Root list is fetched automatically when user + project context is available

**8. "Lists navigation not working properly"** 
- Navigation uses internal history stack - use `goBack()` not browser back
- Check Redux DevTools: `lists.listHistory` should show navigation stack
- `openList()` pushes to history, `goBack()` pops from history
- `goToRoot()` clears history and jumps to first item

**9. "Sub-lists not loading"**
- Sub-lists are cached by parent ID for performance
- Check Redux DevTools: `lists.subListCache` shows cached data
- Cache is invalidated automatically on CRUD operations
- Loading state: `lists.loading` indicates fetch operations

**10. "Entity add/remove not updating UI immediately"**
- Uses optimistic updates for instant feedback
- Check Redux DevTools for `List/add-entity` and `List/remove-entity` actions
- If backend fails, changes automatically revert
- `isEntityInList(entityId)` should update immediately

### Debug Tools

**Redux DevTools:**
```tsx
// Redux DevTools are automatically enabled in development
// Navigate to browser DevTools → Redux tab
```

**State Comparison:**
```tsx
function DebugNotifications() {
  const contextState = useAppNotifications();
  const reduxState = useAppNotificationsRedux();
  
  useEffect(() => {
    console.table({
      'Context Count': contextState.appNotifications?.length ?? 0,
      'Redux Count': reduxState.appNotifications?.length ?? 0,
      'Context Loading': contextState.loading,
      'Redux Loading': reduxState.loading,
    });
  }, [contextState, reduxState]);
  
  return null;
}
```

**Lists State Debugging:**
```tsx
function DebugLists() {
  const { 
    currentList, 
    subLists, 
    loading 
  } = useListsRedux();
  
  useEffect(() => {
    console.group('Lists State');
    console.log('Current List:', currentList?.name ?? 'None');
    console.log('Sub-lists Count:', subLists.length);
    console.log('Loading:', loading);
    console.log('Sub-lists:', subLists.map(l => l.name));
    console.groupEnd();
  }, [currentList, subLists, loading]);
  
  return null;
}

// Add to your app temporarily for debugging
function App() {
  return (
    <ReplykeProvider projectId="..." enableRedux>
      <DebugLists />
      <YourMainApp />
    </ReplykeProvider>
  );
}
```

**Redux DevTools - Lists State:**
```
State → lists
├── currentList: { id: "123", name: "My List", ... }
├── subLists: [{ id: "456", name: "Sub List 1" }, ...]
├── loading: false
├── listHistory: [{ id: "abc", name: "Parent List" }]
├── subListCache: {
│   "123": [{ id: "456", name: "Sub List 1" }]
│ }
└── currentProjectId: "your-project-id"
```

**Common Redux Actions to Watch:**
- `lists/setCurrentList` - Root list loaded
- `lists/openList` - Navigated to sub-list
- `lists/goBack` - Returned to previous list
- `lists/setSubLists` - Sub-lists loaded for current list
- `lists/updateCurrentList` - Entity added/removed from list
- `api/executeQuery/pending` - API call started
- `api/executeQuery/fulfilled` - API call succeeded

## Performance Considerations

### Redux Advantages
- **Centralized State**: Single source of truth for notifications and lists
- **Optimistic Updates**: Instant UI updates with automatic rollback on failure
- **Cache Management**: RTK Query handles caching and deduplication
- **DevTools**: Powerful debugging and time-travel capabilities
- **Smart Caching**: Lists sub-data is cached by parent ID for instant navigation
- **History Management**: Lists navigation history handled in Redux state

### When to Use Redux
- Complex notification/lists interactions
- Multiple components accessing the same data
- Need for optimistic updates (especially lists CRUD operations)
- Advanced debugging requirements
- Cross-component state sharing

### When to Keep Context (App Notifications Only)
- Simple, isolated notification displays
- Single-component usage  
- Legacy code that's working well

**Note**: Lists have been fully migrated to Redux - context version is no longer available.

## Future Roadmap

This Redux infrastructure has been designed to support systematic migrations:

**✅ Completed Migrations:**
- **App Notifications** → `appNotificationsSlice` + RTK Query API
- **Lists System** → `listsSlice` + RTK Query API
- **Authentication** → `authSlice` + login/logout thunks

**🚧 Future Migrations:**
- **Entities System** → `entitiesSlice`
- **Comments System** → `commentsSlice`
- **User Management** → `usersSlice`

Each follows the same pattern: RTK Query for API calls, Redux slices for state management, and consumer-friendly hooks that hide Redux complexity while maintaining identical APIs.

## Support

For questions or issues:
1. Check this guide first
2. Use Redux DevTools to inspect state
3. Compare Context vs Redux behavior side-by-side
4. Open an issue with reproduction steps

---

**Remember**: The goal is identical functionality with better state management. If the Redux version behaves differently than Context, that's a bug to be fixed.