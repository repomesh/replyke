# Replyke Components → Shadcn-Style Component Registry
## Comprehensive Conversion Guide

This document outlines everything needed to convert the `@packages\ui\comments\` directory from an npm-package-based distribution model to a shadcn-style "copy-paste" component registry.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Phase 1: Core Transformations](#phase-1-core-transformations)
4. [Phase 2: CLI Development](#phase-2-cli-development)
5. [Phase 3: Component Registry](#phase-3-component-registry)
6. [Phase 4: Testing & Validation](#phase-4-testing--validation)
7. [Critical Decisions](#critical-decisions)
8. [Implementation Checklist](#implementation-checklist)

---

## 🎯 Overview

### Current State (npm Package Model)
```
packages/ui/comments/
├── social/
│   ├── core/              # @replyke/comments-social-core
│   │   ├── src/
│   │   │   ├── context/   # Style config context
│   │   │   ├── hooks/     # useSocialStyle, useSocialStyleConfig
│   │   │   ├── interfaces/
│   │   │   └── social-base-style.ts
│   ├── react-js/          # @replyke/comments-social-react-js
│   │   └── src/
│   │       └── components/
│   └── react-native/      # @replyke/comments-social-react-native
│       └── src/
│           └── components/
└── threaded/
    ├── core/              # @replyke/comments-threaded-core
    ├── react-js/          # @replyke/comments-threaded-react-js
    └── react-native/      # @replyke/comments-threaded-react-native
```

**Key Characteristics:**
- Built & compiled to ESM/CJS
- Style configuration through Context API and hooks
- Props-based customization (prop explosion problem)
- Installed via `npm install @replyke/comments-social-react-js`

### Target State (Shadcn Model)
```
replyke-components/         # NEW standalone repo
├── packages/
│   └── cli/                # @replyke/cli
│       ├── src/
│       │   ├── commands/
│       │   │   ├── init.ts
│       │   │   ├── add.ts
│       │   │   └── diff.ts
│       │   └── utils/
│       │       ├── registry.ts
│       │       └── installer.ts
│       └── package.json
│
├── registry/
│   ├── react/
│   │   ├── comments-social/
│   │   │   ├── styled/           # Inline styles variant
│   │   │   │   ├── registry.json
│   │   │   │   └── files/
│   │   │   └── tailwind/         # Tailwind variant
│   │   │       ├── registry.json
│   │   │       └── files/
│   │   └── comments-threaded/
│   │       └── ...
│   └── react-native/
│       └── comments-social/
│           └── ...
│
└── README.md
```

**Key Characteristics:**
- Raw source code (no build step)
- Hardcoded base styles directly in components
- Users modify source directly for customization
- Installed via `npx @replyke/cli add comments-social`

---

## 🏗️ Repository Structure

### Create New Standalone Repository

**Repository Name:** `replyke-components` (or `replyke-ui`, `replyke-registry`)

**Reasoning:**
- Separates distribution models (npm vs copy-paste)
- Independent versioning for CLI and components
- No workspace dependency complications
- Clear mental model for users

**Initial Setup:**
```bash
# Outside the monorepo
mkdir replyke-components
cd replyke-components
git init
pnpm init
```

**Directory Structure:**
```
replyke-components/
├── .github/
│   └── workflows/          # CI/CD for CLI publishing
├── packages/
│   └── cli/
│       ├── src/
│       ├── tsconfig.json
│       └── package.json
├── registry/
│   ├── react/
│   └── react-native/
├── .gitignore
├── package.json            # Root workspace config
├── pnpm-workspace.yaml
└── README.md
```

---

## 🔧 Phase 1: Core Transformations

### Critical Question: Do We Need `-core` Packages?

**Current Role of `-core` packages:**
1. `socialBaseStyle` / `threadedBaseStyle` - Default style values
2. `SocialStyleConfigContext` - Context for passing styles
3. `useSocialStyle` hook - Merges user styles with base styles
4. TypeScript interfaces for style props

**Analysis:**

| Use Case | Current (npm) | Shadcn-Style | Verdict |
|----------|---------------|--------------|---------|
| **Base styles** | Exported from `-core`, merged with user props | Hardcoded directly in components | ❌ **NOT NEEDED** |
| **Style context** | Context API for prop drilling | No context - direct values | ❌ **NOT NEEDED** |
| **Style merging** | `useSocialStyle` hook merges props | Users edit hardcoded values | ❌ **NOT NEEDED** |
| **TypeScript types** | Exported for consumers | Inline in components | ❌ **NOT NEEDED** |

**Decision: ELIMINATE `-core` PACKAGES ENTIRELY**

**Transformation Strategy:**

#### Before (Current npm Package):
```tsx
// In component file
import { useSocialStyleConfig } from '@replyke/comments-social-core';

function Comment() {
  const styleConfig = useSocialStyleConfig();

  return (
    <div style={{
      fontSize: styleConfig.commentProps.authorFontSize,
      color: styleConfig.commentProps.authorFontColor,
    }}>
      Author Name
    </div>
  );
}
```

#### After (Shadcn-Style):
```tsx
// In component file - NO IMPORTS NEEDED
function Comment() {
  return (
    <div style={{
      fontSize: 13,              // Hardcoded from socialBaseStyle
      color: '#000',             // Hardcoded from socialBaseStyle
      fontWeight: 700,
    }}>
      Author Name
    </div>
  );
}
```

### Task 1.1: Inline All Base Style Values

**Location:** Every component in `social/react-js/src/` and `threaded/react-js/src/`

**Process:**
1. Open `social/core/src/social-base-style.ts` (reference file)
2. For each component, find all style references like:
   - `styleConfig.commentProps.authorFontSize`
   - `styleConfig.newCommentFormProps.backgroundColor`
3. Replace with the actual value from `socialBaseStyle`:
   - `styleConfig.commentProps.authorFontSize` → `13`
   - `styleConfig.newCommentFormProps.backgroundColor` → `'#fff'`

**Example Transformation:**

Before:
```tsx
// HeartButton.tsx
const HeartButton = ({ styleConfig, ...props }) => {
  return (
    <div style={{ padding: styleConfig.commentProps.heartIconPadding }}>
      <HeartIcon
        size={styleConfig.commentProps.heartIconSize}
        color={props.userUpvoted
          ? styleConfig.commentProps.heartIconFullColor
          : styleConfig.commentProps.heartIconEmptyColor
        }
      />
    </div>
  );
};
```

After:
```tsx
// HeartButton.tsx - Fully standalone
const HeartButton = ({ userUpvoted, ...props }) => {
  return (
    <div style={{ padding: 0, paddingBottom: 4 }}>
      <HeartIcon
        size={14}
        color={userUpvoted ? '#DC2626' : '#8E8E8E'}
      />
    </div>
  );
};
```

**Add Customization Comments:**
```tsx
// HeartButton.tsx - With user guidance
const HeartButton = ({ userUpvoted, ...props }) => {
  // 🎨 CUSTOMIZATION: Icon sizes and colors
  const iconSize = 14;              // Default: 14px
  const filledColor = '#DC2626';    // Default: Red-600
  const emptyColor = '#8E8E8E';     // Default: Gray-500

  return (
    <div style={{ padding: 0, paddingBottom: 4 }}>
      <HeartIcon
        size={iconSize}
        color={userUpvoted ? filledColor : emptyColor}
      />
    </div>
  );
};
```

### Task 1.2: Remove All Context Providers

**Files to Delete:**
- `social/core/src/context/social-style-config-context.tsx`
- `threaded/core/src/context/threaded-style-config-context.tsx`

**Files to Modify:**
- Remove `SocialStyleConfigProvider` wrapping from components
- Remove `useSocialStyleConfig()` hook calls

**Example:**

Before:
```tsx
// SocialCommentSection.tsx
import { SocialStyleConfigProvider } from '@replyke/comments-social-core';

export default function SocialCommentSection({ styleConfig }) {
  return (
    <SocialStyleConfigProvider styleConfig={styleConfig}>
      <CommentsFeed />
      <NewCommentForm />
    </SocialStyleConfigProvider>
  );
}
```

After:
```tsx
// SocialCommentSection.tsx
export default function SocialCommentSection() {
  return (
    <>
      <CommentsFeed />
      <NewCommentForm />
    </>
  );
}
```

### Task 1.3: Remove Style-Related Props

**Props to Remove:**
- `styleConfig` from all component interfaces
- `styleConfigProp` parameters
- Any `Partial<SocialStyleConfig>` type imports

**Example:**

Before:
```tsx
interface SocialCommentSectionProps {
  entity?: Entity;
  styleConfig?: Partial<SocialStyleConfig>;
  callbacks?: SocialStyleCallbacks;
}
```

After:
```tsx
interface SocialCommentSectionProps {
  entity?: Entity;
  callbacks?: SocialStyleCallbacks;
}
```

### Task 1.4: Update Import Statements

**Current Import Pattern:**
```tsx
import { useSocialStyle, SocialStyleConfig } from '@replyke/comments-social-core';
import { SortByButton, CommentsFeed } from '@replyke/comments-social-core';
import { ReplykeAvatar } from '@replyke/ui-core-react-js';
```

**New Import Pattern:**
```tsx
// Internal imports (within copied files)
import { SortByButton } from './components/SortByButton';
import { CommentsFeed } from './components/CommentsFeed';

// External dependencies (user must install)
import { useCommentSection } from '@replyke/react-js';
import { ReplykeAvatar } from '@replyke/ui-core-react-js';
```

**Key Changes:**
1. **Internal components:** Relative imports (`./`, `../`)
2. **External dependencies:** Absolute imports (must be peer dependencies)
3. **Remove all `-core` imports** (no longer exist)

### Task 1.5: Flatten Directory Structure

**Current Structure (nested):**
```
social/react-js/src/
├── components/
│   ├── CommentsFeed/
│   │   ├── Comment/
│   │   │   ├── HeartButton.tsx
│   │   │   ├── Comment.tsx
│   │   │   └── Replies/
│   │   │       └── Replies.tsx
│   │   ├── CommentsFeed.tsx
│   │   └── index.ts
│   ├── NewCommentForm/
│   └── SortByButton/
└── hooks/
```

**Target Structure (cleaner for copy/paste):**
```
registry/react/comments-social/styled/files/
├── social-comment-section.tsx      # Main entry component
├── comments-feed.tsx
├── comment.tsx
├── heart-button.tsx
├── replies.tsx
├── new-comment-form.tsx
├── sort-by-button.tsx
├── comment-menu-modal.tsx
└── lib/
    └── utils.ts                    # Shared utilities
```

**Rationale:**
- Shadcn uses flat structure with kebab-case filenames
- Easier to browse in user's project
- Clear what gets copied

### Task 1.6: Create Tailwind CSS Variant (Optional but Recommended)

**Inline Styles Variant:**
```tsx
// heart-button.tsx (styled variant)
export function HeartButton({ userUpvoted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        padding: 0,
        paddingBottom: 4,
        display: 'flex',
        alignItems: 'center',
        border: 'none',
        background: 'none',
      }}
    >
      <HeartIcon
        size={14}
        color={userUpvoted ? '#DC2626' : '#8E8E8E'}
      />
    </button>
  );
}
```

**Tailwind CSS Variant:**
```tsx
// heart-button.tsx (tailwind variant)
import { cn } from '@/lib/utils';

export function HeartButton({ userUpvoted, onToggle, className }) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        'flex items-center pb-1',
        'border-none bg-transparent',
        className
      )}
    >
      <HeartIcon
        className={cn(
          'h-3.5 w-3.5',
          userUpvoted ? 'text-red-600' : 'text-gray-500'
        )}
      />
    </button>
  );
}
```

**Recommendation:** Start with styled variant (easier), add Tailwind later as a stretch goal.

---

## 🛠️ Phase 2: CLI Development

### Task 2.1: Initialize CLI Package

**Directory:** `packages/cli/`

**package.json:**
```json
{
  "name": "@replyke/cli",
  "version": "0.1.0",
  "description": "CLI for installing Replyke UI components",
  "bin": {
    "replyke": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "build": "tsup src/index.ts --format esm,cjs --dts",
    "dev": "tsup src/index.ts --format esm,cjs --watch"
  },
  "dependencies": {
    "commander": "^11.1.0",
    "prompts": "^2.4.2",
    "chalk": "^5.3.0",
    "ora": "^7.0.1",
    "fs-extra": "^11.2.0",
    "node-fetch": "^3.3.2",
    "execa": "^8.0.1"
  },
  "devDependencies": {
    "tsup": "^8.0.1",
    "typescript": "^5.3.3"
  }
}
```

### Task 2.2: Implement `init` Command

**Purpose:** Set up project configuration for Replyke components

**File:** `packages/cli/src/commands/init.ts`

**Flow:**
1. Detect project type (React vs React Native)
2. Ask user for preferences:
   - Component install directory (default: `src/components/ui`)
   - Styling approach (styled vs tailwind)
   - Platform (react, react-native, expo)
3. Create `replyke.json` config file
4. Check for required peer dependencies
5. Optionally install peer dependencies

**Configuration File (`replyke.json`):**
```json
{
  "platform": "react",
  "style": "styled",
  "typescript": true,
  "paths": {
    "components": "src/components/ui",
    "lib": "src/lib"
  },
  "aliases": {
    "@/components": "./src/components",
    "@/lib": "./src/lib"
  }
}
```

**Implementation Sketch:**
```typescript
// init.ts
import prompts from 'prompts';
import fs from 'fs-extra';
import { detectProjectType } from '../utils/detect';

export async function init() {
  const projectType = await detectProjectType();

  const answers = await prompts([
    {
      type: 'select',
      name: 'platform',
      message: 'Which platform are you using?',
      choices: [
        { title: 'React', value: 'react' },
        { title: 'React Native', value: 'react-native' },
        { title: 'Expo', value: 'expo' },
      ],
      initial: projectType === 'react-native' ? 1 : 0,
    },
    {
      type: 'select',
      name: 'style',
      message: 'Which styling approach?',
      choices: [
        { title: 'Inline Styles (more portable)', value: 'styled' },
        { title: 'Tailwind CSS', value: 'tailwind' },
      ],
    },
    {
      type: 'text',
      name: 'componentsPath',
      message: 'Where to install components?',
      initial: 'src/components/ui',
    },
  ]);

  const config = {
    platform: answers.platform,
    style: answers.style,
    typescript: true,
    paths: {
      components: answers.componentsPath,
      lib: 'src/lib',
    },
  };

  await fs.writeJson('replyke.json', config, { spaces: 2 });

  console.log('✅ Configuration saved to replyke.json');

  // Check peer dependencies
  await checkDependencies(answers.platform);
}

async function checkDependencies(platform: string) {
  const requiredDeps = platform === 'react'
    ? ['@replyke/react-js', '@replyke/ui-core-react-js']
    : ['@replyke/react-native', '@replyke/ui-core-react-native'];

  const packageJson = await fs.readJson('package.json');
  const missing = requiredDeps.filter(
    dep => !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
  );

  if (missing.length > 0) {
    console.warn('⚠️  Missing required dependencies:');
    missing.forEach(dep => console.log(`  - ${dep}`));

    const { install } = await prompts({
      type: 'confirm',
      name: 'install',
      message: 'Install missing dependencies now?',
    });

    if (install) {
      await installDependencies(missing);
    }
  }
}
```

### Task 2.3: Implement `add` Command

**Purpose:** Copy component files into user's project

**File:** `packages/cli/src/commands/add.ts`

**Flow:**
1. Read `replyke.json` to get user preferences
2. Fetch component registry metadata
3. Download component files
4. Transform imports to match user's project structure
5. Write files to user's project
6. Check for missing dependencies
7. Report success

**Registry Metadata Format:**
```json
{
  "name": "comments-social",
  "platform": "react",
  "style": "styled",
  "version": "1.0.0",
  "description": "Social-style comment section with likes and replies",
  "dependencies": [
    "@replyke/react-js@^6.0.0",
    "@replyke/ui-core-react-js@^6.0.0"
  ],
  "files": [
    {
      "path": "social-comment-section.tsx",
      "target": "social-comment-section.tsx",
      "type": "component"
    },
    {
      "path": "comments-feed.tsx",
      "target": "comments-feed.tsx",
      "type": "component"
    },
    {
      "path": "lib/utils.ts",
      "target": "../../lib/utils.ts",
      "type": "lib"
    }
  ],
  "registryUrl": "https://raw.githubusercontent.com/replyke/replyke-components/main/registry/react/comments-social/styled"
}
```

**Implementation Sketch:**
```typescript
// add.ts
import fs from 'fs-extra';
import fetch from 'node-fetch';
import ora from 'ora';
import path from 'path';

export async function add(componentName: string) {
  const config = await fs.readJson('replyke.json');
  const spinner = ora(`Fetching ${componentName}...`).start();

  // Fetch registry metadata
  const registryUrl = `https://raw.githubusercontent.com/replyke/replyke-components/main/registry/${config.platform}/${componentName}/${config.style}/registry.json`;
  const response = await fetch(registryUrl);
  const registry = await response.json();

  spinner.text = 'Downloading files...';

  // Download each file
  for (const file of registry.files) {
    const fileUrl = `${registry.registryUrl}/files/${file.path}`;
    const fileContent = await fetch(fileUrl).then(r => r.text());

    // Transform imports
    const transformed = transformImports(fileContent, config);

    // Write to user's project
    const targetPath = path.join(
      config.paths.components,
      file.target
    );
    await fs.ensureDir(path.dirname(targetPath));
    await fs.writeFile(targetPath, transformed);
  }

  spinner.succeed(`Added ${componentName}`);

  // Check dependencies
  await checkComponentDependencies(registry.dependencies);

  console.log('\n✅ Component installed successfully!');
  console.log(`📁 Files added to ${config.paths.components}`);
}

function transformImports(content: string, config: any): string {
  // Replace registry imports with user's project structure
  return content
    .replace(
      /from ['"]\.\.?\//g,
      `from '${config.aliases['@/components']}/`
    );
}
```

### Task 2.4: Implement `diff` Command (Low Priority)

**Purpose:** Show what changed in registry since user installed

**File:** `packages/cli/src/commands/diff.ts`

This is a nice-to-have feature for later. Skip for MVP.

---

## 📦 Phase 3: Component Registry

### Task 3.1: Create Registry Structure

**For Each Component System:**
```
registry/
├── react/
│   ├── comments-social/
│   │   ├── styled/
│   │   │   ├── registry.json
│   │   │   └── files/
│   │   │       ├── social-comment-section.tsx
│   │   │       ├── comments-feed.tsx
│   │   │       ├── comment.tsx
│   │   │       ├── heart-button.tsx
│   │   │       ├── replies.tsx
│   │   │       ├── new-comment-form.tsx
│   │   │       ├── sort-by-button.tsx
│   │   │       ├── comment-menu-modal.tsx
│   │   │       └── lib/
│   │   │           └── utils.ts
│   │   └── tailwind/
│   │       └── ...
│   └── comments-threaded/
│       └── ...
└── react-native/
    └── comments-social/
        └── ...
```

### Task 3.2: Transform Component Files

**For Each Component:**

1. **Remove index.ts barrel exports** - Not needed for direct imports
2. **Add file header comments:**
   ```tsx
   /**
    * Replyke Social Comment Section
    *
    * A complete comment system with likes, replies, and moderation.
    *
    * Installation: npx @replyke/cli add comments-social
    *
    * Required dependencies:
    * - @replyke/react-js ^6.0.0
    * - @replyke/ui-core-react-js ^6.0.0
    *
    * @see https://docs.replyke.com/components/comments-social
    */
   ```

3. **Add customization markers:**
   ```tsx
   // 🎨 CUSTOMIZATION: Color scheme
   const colors = {
     primary: '#000',
     secondary: '#737373',
     accent: '#DC2626',
   };

   // 🎨 CUSTOMIZATION: Spacing
   const spacing = {
     gap: 8,
     padding: 12,
   };
   ```

4. **Use explicit imports:**
   ```tsx
   // ✅ Good - Explicit
   import { useCommentSection } from '@replyke/react-js';
   import { Comment as CommentType } from '@replyke/react-js';

   // ❌ Avoid - Barrel imports can cause issues
   import { useCommentSection, Comment as CommentType } from '@replyke/react-js';
   ```

### Task 3.3: Create registry.json for Each Component

**Template:**
```json
{
  "name": "comments-social",
  "platform": "react",
  "style": "styled",
  "version": "1.0.0",
  "description": "Social-style comment section with likes and replies",
  "author": "Replyke",
  "license": "Apache-2.0",
  "dependencies": [
    "@replyke/react-js@^6.0.0",
    "@replyke/ui-core-react-js@^6.0.0"
  ],
  "files": [
    {
      "path": "social-comment-section.tsx",
      "target": "social-comment-section.tsx",
      "type": "component",
      "description": "Main wrapper component"
    },
    {
      "path": "comments-feed.tsx",
      "target": "comments-feed.tsx",
      "type": "component",
      "description": "Scrollable list of comments"
    },
    {
      "path": "comment.tsx",
      "target": "comment.tsx",
      "type": "component",
      "description": "Individual comment with actions"
    },
    {
      "path": "heart-button.tsx",
      "target": "heart-button.tsx",
      "type": "component",
      "description": "Like/unlike button"
    },
    {
      "path": "replies.tsx",
      "target": "replies.tsx",
      "type": "component",
      "description": "Nested replies list"
    },
    {
      "path": "new-comment-form.tsx",
      "target": "new-comment-form.tsx",
      "type": "component",
      "description": "Comment input form"
    },
    {
      "path": "sort-by-button.tsx",
      "target": "sort-by-button.tsx",
      "type": "component",
      "description": "Comment sorting controls"
    },
    {
      "path": "comment-menu-modal.tsx",
      "target": "comment-menu-modal.tsx",
      "type": "component",
      "description": "Comment action menu modal"
    },
    {
      "path": "lib/utils.ts",
      "target": "../../lib/utils.ts",
      "type": "lib",
      "description": "Utility functions"
    }
  ],
  "registryUrl": "https://raw.githubusercontent.com/replyke/replyke-components/main/registry/react/comments-social/styled"
}
```

---

## ✅ Phase 4: Testing & Validation

### Task 4.1: Create Test Projects (OPTIONAL - Low Priority)

**Purpose:** Ensure components work in real projects

**Test Matrix:**
| Project Type | Package Manager | Bundler |
|--------------|-----------------|---------|
| Create React App | npm | Webpack |
| Vite | pnpm | Vite |
| Next.js 14 | pnpm | Turbopack |
| React Native | npm | Metro |
| Expo | npm | Metro |

Skip for MVP. Test manually in one project first.

### Task 4.2: Manual Testing Flow

**Steps:**
1. Create fresh React app: `npx create-vite@latest test-app --template react-ts`
2. Install dependencies: `npm install @replyke/react-js @replyke/ui-core-react-js`
3. Initialize Replyke: `npx @replyke/cli init`
4. Add component: `npx @replyke/cli add comments-social`
5. Import and use:
   ```tsx
   import { SocialCommentSection } from './components/ui/social-comment-section';
   ```
6. Verify:
   - Components render correctly
   - No TypeScript errors
   - Styles are applied
   - User can modify styles

---

## 🚨 Critical Decisions

### Decision 1: Eliminate `-core` Packages

**Question:** Do we need the `-core` packages at all?

**Analysis:**
- Current role: Style configuration management
- Shadcn approach: Hardcode everything
- User customization: Direct file editing

**DECISION:** ✅ **ELIMINATE ENTIRELY**

**Action Items:**
- [x] Remove all context providers
- [x] Remove all style hooks
- [x] Inline all base style values
- [x] Delete `-core` directories from registry

### Decision 2: Peer Dependency Management

**Question:** What should users install?

**Current npm packages:**
- Users install: `@replyke/comments-social-react-js`
- Gets automatically: `@replyke/comments-social-core`, `@replyke/ui-core-react-js`

**Shadcn approach:**
- Users install: Base platform package
- CLI copies: Component source files

**DECISION:** ✅ **Users install platform packages, CLI copies UI components**

**Required user installations:**
```bash
# For React
npm install @replyke/react-js @replyke/ui-core-react-js

# For React Native
npm install @replyke/react-native @replyke/ui-core-react-native

# For Expo
npm install @replyke/expo @replyke/ui-core-react-native
```

**Note:** According to point #2 in requirements, users typically install `@replyke/react-js` which ships core under the hood. This is perfect for shadcn-style!

### Decision 3: Component Naming Convention

**Options:**
- `SocialCommentSection` (PascalCase) - Current
- `social-comment-section.tsx` (kebab-case) - Shadcn convention

**DECISION:** ✅ **Use kebab-case filenames, keep PascalCase exports**

**Example:**
```tsx
// File: social-comment-section.tsx
export function SocialCommentSection() {
  // ...
}

// Usage
import { SocialCommentSection } from './components/ui/social-comment-section';
```

### Decision 4: Styling Approach Priority

**Question:** Which variant to build first?

**Options:**
1. Inline styles only (current approach)
2. Tailwind only (more shadcn-like)
3. Both simultaneously

**DECISION:** ✅ **Inline styles first, Tailwind as stretch goal**

**Reasoning:**
- Inline styles are more portable (no setup required)
- Matches current implementation
- React Native only supports inline styles
- Tailwind can be added later without breaking changes

### Decision 5: Documentation Priority

**Question:** When to create examples and docs?

**User specified:** "Examples and docs are extra that I MIGHT do after. Make sure it isn't perceived as high or similar priority"

**DECISION:** ✅ **Skip for MVP**

**Action:** Focus on:
1. ✅ Core functionality (CLI + registry)
2. ✅ Basic README with installation instructions
3. ❌ Example projects (later)
4. ❌ Comprehensive docs (later)

---

## 📝 Implementation Checklist

### Prerequisites
- [ ] Create new standalone repository: `replyke-components`
- [ ] Copy `@packages/ui/comments/` to new repo
- [ ] Initialize git, pnpm workspace

### Phase 1: Transform Components (HIGH PRIORITY)

**For `social/react-js`:**
- [ ] Open `social/core/src/social-base-style.ts` as reference
- [ ] For each component file:
  - [ ] Replace `styleConfig.X` with hardcoded values from base style
  - [ ] Remove `styleConfig` from props
  - [ ] Remove context provider imports/usage
  - [ ] Add customization comment markers
  - [ ] Update imports to relative paths
- [ ] Delete entire `social/core` directory
- [ ] Rename files to kebab-case
- [ ] Flatten directory structure
- [ ] Test that components compile without errors

**For `threaded/react-js`:**
- [ ] Same process as above using `threaded-base-style.ts`

**For React Native variants:**
- [ ] Same process for `social/react-native`
- [ ] Same process for `threaded/react-native`

### Phase 2: Build CLI (HIGH PRIORITY)

- [ ] Create `packages/cli` directory
- [ ] Initialize package.json with dependencies
- [ ] Implement `init` command
  - [ ] Project type detection
  - [ ] User prompts for preferences
  - [ ] Config file generation
  - [ ] Dependency checking
- [ ] Implement `add` command
  - [ ] Config reading
  - [ ] Registry metadata fetching
  - [ ] File downloading
  - [ ] Import transformation
  - [ ] File writing
- [ ] Build and test CLI locally
- [ ] Publish to npm (or test with `npx` link)

### Phase 3: Create Registry (HIGH PRIORITY)

- [ ] Create `registry/` directory structure
- [ ] For each component system:
  - [ ] Create `registry.json` metadata
  - [ ] Copy transformed component files to `files/`
  - [ ] Verify all imports are correct
  - [ ] Test manual file installation
- [ ] Push to GitHub
- [ ] Verify URLs are accessible

### Phase 4: Testing (MEDIUM PRIORITY)

- [ ] Create test React project
- [ ] Run `npx @replyke/cli init`
- [ ] Run `npx @replyke/cli add comments-social`
- [ ] Verify components render
- [ ] Verify TypeScript types work
- [ ] Verify users can modify styles
- [ ] Test React Native variant (if time permits)

### Phase 5: Documentation (LOW PRIORITY - SKIP FOR MVP)

- [ ] ⏸️ Write README for CLI
- [ ] ⏸️ Write README for registry
- [ ] ⏸️ Create example projects
- [ ] ⏸️ Write migration guide from npm packages

---

## 🎯 Success Criteria

### Minimum Viable Product (MVP)

1. **Repository exists** with structure: `packages/cli/` and `registry/`
2. **CLI works** for one component:
   ```bash
   npx @replyke/cli init
   npx @replyke/cli add comments-social
   ```
3. **Components are transformed:**
   - No `-core` dependencies
   - Hardcoded styles from base style
   - Relative imports
   - Customization comments
4. **Manual test passes:**
   - Fresh React app
   - CLI installs component
   - Component renders
   - User can modify styles

### Stretch Goals (After MVP)

- [ ] Tailwind CSS variants
- [ ] React Native components
- [ ] `diff` command
- [ ] Example projects
- [ ] Comprehensive documentation
- [ ] Automated testing
- [ ] Component preview website

---

## 🔑 Key Reminders

1. **Eliminate `-core` entirely** - Hardcode all styles
2. **Users install platform packages** (`@replyke/react-js`, not `@replyke/core`)
3. **Examples/docs are LOW priority** - Focus on core functionality
4. **Start with inline styles** - Tailwind can come later
5. **Test in a real project** - Don't assume it works
6. **Standalone repo** - Keep separate from monorepo

---

## 📚 Additional Resources

**Shadcn References:**
- Shadcn CLI source: https://github.com/shadcn/ui/tree/main/packages/cli
- Shadcn registry format: https://ui.shadcn.com/docs/components-json
- Component example: https://github.com/shadcn/ui/blob/main/apps/www/registry/default/ui/button.tsx

**Implementation Order:**
1. Transform one component (`heart-button.tsx`) as proof of concept
2. Build minimal CLI with `add` command for that one component
3. Test end-to-end with test project
4. Scale to all components
5. Add features (init, multiple components, etc.)

---

## 🎬 Getting Started

**Immediate Next Steps:**

1. Create new repo: `mkdir replyke-components && cd replyke-components`
2. Copy comments directory: `cp -r ../monorepo/packages/ui/comments ./temp-source`
3. Start with one component: Pick `HeartButton.tsx`
4. Transform it:
   - Remove styleConfig imports
   - Hardcode values
   - Add comments
5. Test that it compiles
6. Repeat for all files
7. Build CLI
8. Test end-to-end

**Good luck! 🚀**
