# Redux Migration Guide

This guide explains how to migrate from Context-based state management to Redux Toolkit for app notifications in the Replyke framework.

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

## Performance Considerations

### Redux Advantages
- **Centralized State**: Single source of truth for notifications
- **Optimistic Updates**: Instant UI updates with automatic rollback on failure
- **Cache Management**: RTK Query handles caching and deduplication
- **DevTools**: Powerful debugging and time-travel capabilities

### When to Use Redux
- Complex notification interactions
- Multiple components accessing notification data
- Need for optimistic updates
- Advanced debugging requirements

### When to Keep Context
- Simple, isolated notification displays
- Single-component usage
- Legacy code that's working well

## Future Roadmap

This Redux infrastructure is designed to support future migrations:

- **Entities System** → `entitiesSlice`
- **Lists System** → `listsSlice` 
- **Comments System** → `commentsSlice`
- **User Management** → `usersSlice`

Each will follow the same pattern: RTK Query for API calls, Redux slices for state management, and consumer-friendly hooks that hide Redux complexity.

## Support

For questions or issues:
1. Check this guide first
2. Use Redux DevTools to inspect state
3. Compare Context vs Redux behavior side-by-side
4. Open an issue with reproduction steps

---

**Remember**: The goal is identical functionality with better state management. If the Redux version behaves differently than Context, that's a bug to be fixed.