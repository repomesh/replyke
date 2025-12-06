# Hierarchical Spaces API Documentation

## Overview

Spaces in Replyke now support hierarchical nesting, enabling any space to contain child spaces. This creates a flexible system that supports:
- **Flat communities** (like Reddit subreddits)
- **Nested communities** (like Discord servers with channels)
- **Future chat rooms** organized under parent spaces

## Data Model

### Space Object

```typescript
interface Space {
  // Core identifiers
  id: string;                    // UUID
  projectId: string;             // Project this space belongs to
  shortId: string;               // Short unique ID (auto-generated)
  slug: string | null;           // URL-friendly slug (optional, globally unique per project)

  // Display info
  name: string;                  // Space name (3-100 chars)
  description: string | null;    // Description (max 1000 chars)
  avatar: string | null;         // Avatar URL
  banner: string | null;         // Banner image URL

  // Ownership & permissions
  userId: string;                // Creator/owner ID
  visibility: "public" | "private";
  postingPermission: "anyone" | "members" | "admins";
  requireJoinApproval: boolean;  // If true, joins need approval

  // Hierarchy (NEW)
  parentSpaceId: string | null;  // Parent space ID (null = root-level)
  depth: number;                 // Depth in tree (0 = root, 1 = child, etc.)

  // Metadata
  metadata: Record<string, any>; // Flexible JSON object (max 1MB)

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Computed fields (included in API responses)
  membersCount: number;          // Count of active members
  childSpacesCount: number;      // Count of immediate children (NEW)
}
```

### SpaceMember Object

```typescript
interface SpaceMember {
  id: string;
  projectId: string;
  spaceId: string;
  userId: string;
  role: "admin" | "moderator" | "member";
  status: "pending" | "active" | "banned" | "rejected";
  joinedAt: Date;
  createdAt: Date;
}
```

## Key Concepts

### Hierarchy Rules

1. **Fully Recursive**: Any space can have child spaces (no type restrictions)
2. **Max Depth**: 10 levels maximum (0-9 depth values)
3. **Root Spaces**: Spaces with `parentSpaceId = null` and `depth = 0`
4. **Independent Membership**: Each space has its own member list (no inheritance)
5. **CASCADE Delete**: Deleting a parent space deletes all descendants
6. **Circular Prevention**: Cannot set a descendant as a parent

### Visibility & Permissions

- **`visibility`**: Controls discoverability in listings
  - `"public"`: Appears in general space listings
  - `"private"`: Only appears in "my spaces" for members
  - Note: ALL spaces (public and private) can be viewed directly via ID/shortId/slug (useful for invite links)

- **`postingPermission`**: Controls who can post entities
  - `"anyone"`: Any authenticated user (no membership required)
  - `"members"`: Only active members
  - `"admins"`: Only admins

- **`requireJoinApproval`**: Controls join flow
  - `true`: Join requests start as "pending", need admin/mod approval
  - `false`: Join requests auto-approved as "active"

## API Endpoints

### Base URL
```
/api/v6/spaces
```

---

## CRUD Operations

### 1. Create Space

**Endpoint**: `POST /api/v6/spaces`

**Auth**: Required

**Rate Limit**: 20 requests per 5 minutes

**Request Body**:
```json
{
  "name": "Space Name",
  "slug": "space-slug",                    // Optional, URL-friendly
  "description": "Space description",      // Optional
  "avatar": "https://...",                 // Optional
  "banner": "https://...",                 // Optional
  "visibility": "public",                  // Optional, default: "public"
  "postingPermission": "members",          // Optional, default: "members"
  "requireJoinApproval": true,             // Optional, default: true
  "metadata": {},                          // Optional
  "parentSpaceId": "parent-uuid"           // Optional (NEW) - omit for root space
}
```

**Response**: `201 Created`
```json
{
  "id": "space-uuid",
  "projectId": "project-uuid",
  "userId": "creator-uuid",
  "shortId": "abc123",
  "name": "Space Name",
  "slug": "space-slug",
  "description": "Space description",
  "avatar": "https://...",
  "banner": "https://...",
  "visibility": "public",
  "postingPermission": "members",
  "requireJoinApproval": true,
  "metadata": {},
  "parentSpaceId": "parent-uuid",
  "depth": 1,
  "createdAt": "2025-12-03T...",
  "updatedAt": "2025-12-03T...",
  "deletedAt": null,
  "membersCount": 1,
  "childSpacesCount": 0
}
```

**Errors**:
- `400`: Invalid name, slug format, or max depth exceeded
- `404`: Parent space not found
- `409`: Slug already taken

---

### 2. Fetch Many Spaces (List)

**Endpoint**: `GET /api/v6/spaces`

**Auth**: Optional

**Rate Limit**: 200 requests per 5 minutes

**Query Parameters**:
```
?page=1                        // Pagination page (default: 1)
&limit=20                      // Results per page (default: 20, max: 100)
&sortBy=newest                 // Sort: "newest", "members", "alphabetical"
&search=query                  // Search by name/description
&visibility=public             // Filter: "public" or "private"
&memberOf=true                 // Filter to spaces user is member of
&parentSpaceId=null            // Filter by parent (NEW)
                               // - "null" or "" = root-level spaces only
                               // - UUID = children of specific parent
                               // - omit = all spaces
```

**Response**: `200 OK`
```json
[
  {
    "id": "space-uuid",
    "name": "Space Name",
    "parentSpaceId": null,
    "depth": 0,
    "membersCount": 150,
    "childSpacesCount": 5,
    // ... other space fields
  }
]
```

**Example Use Cases**:
```javascript
// Get all root-level spaces
GET /api/v6/spaces?parentSpaceId=null

// Get children of a specific space
GET /api/v6/spaces?parentSpaceId=abc-123-def

// Get user's spaces
GET /api/v6/spaces?memberOf=true

// Search within root spaces
GET /api/v6/spaces?parentSpaceId=null&search=gaming
```

---

### 3. Fetch Single Space

**Endpoint**: `GET /api/v6/spaces/:spaceId`

**Auth**: Optional

**Rate Limit**: 1000 requests per 5 minutes

**Response**: `200 OK`
```json
{
  "id": "space-uuid",
  "name": "Space Name",
  "parentSpaceId": "parent-uuid",
  "depth": 2,
  "membersCount": 45,
  "childSpacesCount": 3,
  // ... other space fields

  "userRole": {                  // Only if authenticated and member
    "role": "admin",
    "status": "active",
    "canPost": true,
    "canModerate": true,
    "isAdmin": true
  },

  "parentSpace": {               // NEW - Parent info (if exists)
    "id": "parent-uuid",
    "shortId": "parent123",
    "name": "Parent Space",
    "slug": "parent-slug",
    "avatar": "https://..."
  },

  "childSpaces": [               // NEW - Children preview (max 10)
    {
      "id": "child-uuid",
      "shortId": "child123",
      "name": "Child Space",
      "slug": "child-slug",
      "avatar": "https://...",
      "visibility": "public"
    }
  ]
}
```

**Alternative Lookups**:
- By shortId: `GET /api/v6/spaces/by-short-id?shortId=abc123`
- By slug: `GET /api/v6/spaces/by-slug?slug=my-space`

---

### 4. Update Space

**Endpoint**: `PATCH /api/v6/spaces/:spaceId`

**Auth**: Required (Admin only)

**Rate Limit**: 50 requests per 5 minutes

**Request Body** (all fields optional):
```json
{
  "name": "New Name",
  "slug": "new-slug",
  "description": "New description",
  "avatar": "https://...",
  "banner": "https://...",
  "visibility": "private",
  "postingPermission": "admins",
  "requireJoinApproval": false,
  "metadata": {}
}
```

**Note**: Moving spaces between parents is not yet implemented. Contact backend if needed.

**Response**: `200 OK` (Updated space object)

**Errors**:
- `403`: User is not an admin
- `404`: Space not found
- `409`: Slug already taken

---

### 5. Delete Space

**Endpoint**: `DELETE /api/v6/spaces/:spaceId`

**Auth**: Required (Admin only)

**Rate Limit**: 10 requests per 5 minutes

**Response**: `200 OK`
```json
{
  "message": "Space deleted successfully.",
  "deletedCounts": {
    "entities": 42,
    "members": 15,
    "childSpaces": 3          // NEW - Number of child spaces deleted
  }
}
```

**Important**:
- This is a soft delete (recoverable via `deletedAt`)
- ALL child spaces are CASCADE deleted
- ALL entities in the space and children are deleted
- ALL members are removed

**Errors**:
- `403`: User is not an admin
- `404`: Space not found

---

## Hierarchy-Specific Endpoints (NEW)

### 6. Fetch Child Spaces

**Endpoint**: `GET /api/v6/spaces/:spaceId/children`

**Auth**: Optional

**Rate Limit**: 200 requests per 5 minutes

**Query Parameters**:
```
?page=1       // Pagination page (default: 1)
&limit=20     // Results per page (default: 20, max: 100)
```

**Response**: `200 OK`
```json
[
  {
    "id": "child-uuid",
    "name": "Child Space",
    "parentSpaceId": "parent-uuid",
    "depth": 1,
    "membersCount": 25,
    "childSpacesCount": 2,
    // ... other space fields
  }
]
```

**Use Case**: Get paginated list of immediate children (sorted alphabetically)

---

### 7. Fetch Space Breadcrumb

**Endpoint**: `GET /api/v6/spaces/:spaceId/breadcrumb`

**Auth**: Optional

**Rate Limit**: 1000 requests per 5 minutes

**Response**: `200 OK`
```json
{
  "breadcrumb": [
    {
      "id": "root-uuid",
      "shortId": "root123",
      "name": "Root Space",
      "slug": "root-slug",
      "avatar": "https://...",
      "parentSpaceId": null,
      "depth": 0
    },
    {
      "id": "parent-uuid",
      "shortId": "parent123",
      "name": "Parent Space",
      "slug": "parent-slug",
      "avatar": "https://...",
      "parentSpaceId": "root-uuid",
      "depth": 1
    },
    {
      "id": "current-uuid",
      "shortId": "current123",
      "name": "Current Space",
      "slug": "current-slug",
      "avatar": "https://...",
      "parentSpaceId": "parent-uuid",
      "depth": 2
    }
  ],
  "depth": 2
}
```

**Use Case**: Display navigation breadcrumb (Home > Gaming > Minecraft)

---

## Membership Endpoints (Unchanged)

### 8. Join Space

**Endpoint**: `POST /api/v6/spaces/:spaceId/join`

**Auth**: Required

**Response**: Membership object with status (pending or active)

---

### 9. Leave Space

**Endpoint**: `DELETE /api/v6/spaces/:spaceId/leave`

**Auth**: Required

---

### 10. Fetch Space Members

**Endpoint**: `GET /api/v6/spaces/:spaceId/members`

**Auth**: Optional

**Query Parameters**: `page`, `limit`, `role`, `status`

---

### 11. Fetch User's Spaces

**Endpoint**: `GET /api/v6/spaces/my-spaces`

**Auth**: Required

**Response**: List of spaces where user is a member

---

### 12-15. Member Management

- `PATCH /api/v6/spaces/:spaceId/members/:memberId/role` - Update member role (admin only)
- `PATCH /api/v6/spaces/:spaceId/members/:memberId/approve` - Approve pending member (admin/mod)
- `PATCH /api/v6/spaces/:spaceId/members/:memberId/decline` - Decline pending member (admin/mod)
- `DELETE /api/v6/spaces/:spaceId/members/:memberId` - Remove/ban member (admin/mod)

---

## Frontend Implementation Guide

### Common UI Patterns

#### 1. Space Tree Navigation

```javascript
// Display space hierarchy
async function loadSpaceTree(spaceId = null) {
  const spaces = await fetch(
    `/api/v6/spaces?parentSpaceId=${spaceId || 'null'}&limit=100`
  );

  // Render as expandable tree
  spaces.forEach(space => {
    renderSpaceNode(space);
    if (space.childSpacesCount > 0) {
      // Add expand button
    }
  });
}
```

#### 2. Breadcrumb Navigation

```javascript
// Display breadcrumb for current space
async function renderBreadcrumb(spaceId) {
  const { breadcrumb } = await fetch(
    `/api/v6/spaces/${spaceId}/breadcrumb`
  );

  // Render: Home > Parent > Current
  breadcrumb.forEach((space, index) => {
    renderBreadcrumbItem(space, index === breadcrumb.length - 1);
  });
}
```

#### 3. Create Child Space

```javascript
// Create a space under current space
async function createChildSpace(parentSpaceId, data) {
  const response = await fetch('/api/v6/spaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...data,
      parentSpaceId: parentSpaceId // Add parent
    })
  });

  if (response.ok) {
    // Refresh parent space to show new child
  }
}
```

#### 4. Space Selector (Flat List with Hierarchy)

```javascript
// Show all spaces with indentation based on depth
async function loadSpaceSelector() {
  const allSpaces = await fetch('/api/v6/spaces?limit=100');

  // Group by parent and render with indentation
  const tree = buildTree(allSpaces);
  renderFlatTreeList(tree);
}

function renderSpaceOption(space) {
  const indent = '  '.repeat(space.depth);
  return `${indent}${space.name}`;
}
```

### Error Handling

```javascript
async function createSpace(data) {
  try {
    const response = await fetch('/api/v6/spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const error = await response.json();

      switch (error.code) {
        case 'space/parent-not-found':
          alert('Parent space not found');
          break;
        case 'space/max-depth-exceeded':
          alert('Maximum nesting depth (10 levels) exceeded');
          break;
        case 'space/slug-taken':
          alert('This slug is already taken');
          break;
        default:
          alert(error.error);
      }
    }
  } catch (err) {
    console.error('Network error:', err);
  }
}
```

## Validation Rules

### Slug Format
- Pattern: `/^[a-z0-9]+(?:-[a-z0-9]+)*$/`
- Length: 3-50 characters
- Must be lowercase alphanumeric with hyphens only
- Example: `gaming-community`, `minecraft-survival`

### Name
- Length: 3-100 characters
- Required field
- Auto-trimmed

### Description
- Max length: 1000 characters
- Optional

### Metadata
- Max size: 1MB
- Must be valid JSON object

## Important Constraints

1. **Max Depth**: Cannot create spaces deeper than 10 levels (depth 0-9)
2. **Circular References**: System prevents setting a descendant as a parent
3. **Slug Uniqueness**: Slugs are globally unique per project (not scoped to parent)
4. **Creator Restrictions**: Space creator cannot leave the space (must transfer ownership or delete)
5. **Last Admin**: Cannot remove/demote the last admin of a space

## Testing Checklist

### Basic Hierarchy
- [ ] Create root space (`parentSpaceId: null`)
- [ ] Create child space with parent
- [ ] Create grandchild space (3 levels deep)
- [ ] Verify `depth` field is correct at each level
- [ ] Verify `childSpacesCount` updates when adding children

### Navigation
- [ ] Fetch root spaces with `?parentSpaceId=null`
- [ ] Fetch children of a space using `/children` endpoint
- [ ] Fetch breadcrumb and verify ancestor chain
- [ ] Verify `parentSpace` and `childSpaces` in single space fetch

### Edge Cases
- [ ] Try creating space at depth 10 (should succeed)
- [ ] Try creating space at depth 11 (should fail with max-depth-exceeded)
- [ ] Delete parent space and verify children are deleted
- [ ] Verify cascade delete counts are accurate

### Permissions
- [ ] Verify independent membership (joining parent doesn't join children)
- [ ] Test posting permissions at different levels
- [ ] Verify admin-only operations (update, delete)

## Migration Notes

**Backward Compatibility**: All existing spaces automatically become root-level spaces with:
- `parentSpaceId = null`
- `depth = 0`
- `childSpacesCount = 0`

No breaking changes to existing API endpoints.

## Support

For questions or issues, contact the backend team or check:
- Implementation plan: `C:\Users\Yanay\.claude\plans\distributed-hopping-plum.md`
- Migration file: `src/migrations/20251203150117-add-space-hierarchy.js`
