# Sublay: Open-Source Infrastructure layer for user-created content and social graphs

<!-- <a target="_blank" href="https://discord.gg/REKxnCJzPz"><img src="https://dcbadge.limes.pink/api/server/REKxnCJzPz?compact=true" alt="" /></a> -->

<p align="center">
    <a href="https://sublay.io" target="_blank"><img src="assets/banner.webp" alt="Sublay banner with logo and text saying "Empowering developers to build engaging communities inside their apps"></a>
    <br />
    <br />
    <h3 align="center">Sublay is an open source toolkit for adding production‑grade social features to any web or mobile app.</h3>
    <br />
    <br />
</p>

[![npm](https://img.shields.io/npm/v/@sublay/core.svg?label=npm%20%40sublay%2Fcore)](https://www.npmjs.com/package/@sublay/core)
[![License](https://img.shields.io/github/license/sublay/monorepo)](LICENSE) ![npm](https://img.shields.io/badge/types-included-blue)
[![runs with expo](https://img.shields.io/badge/Runs%20with%20Expo-4630EB.svg?&logo=EXPO&labelColor=f3f3f3&logoColor=000)](https://expo.io/)
![Discord](https://img.shields.io/discord/1325775309148000288?label=Discord&logo=discord&logoColor=white)
<a href="https://x.com/intent/follow?screen_name=sublayjs" target="_blank">
<img src="https://img.shields.io/twitter/follow/sublayjs?style=social"/>
</a>
<a href="https://x.com/intent/follow?screen_name=yantsab" target="_blank">
<img src="https://img.shields.io/twitter/follow/yantsab?style=social"/>
</a>

Sublay gives developers a complete foundation for building social experiences - comments, votes, notifications, feeds, and more - without reinventing the wheel. Instead of wiring together a mix of libraries or building from scratch, Sublay offers drop-in APIs, SDKs, and components that are production-ready out of the box.

Built with a headless, TypeScript-first architecture, Sublay fits seamlessly into your stack. Whether you’re building a full social network or just need user comments on a blog post - Sublay has you covered.

![Dashboard](/assets/dashboard.webp)

## Table of Contents

- [Key Features](#key-features)
- [Why Sublay](#why-sublay)
- [Approach and Structure](#building-sublay-a-layered-api-centric-approach)
- [Moderation](#moderation-with-the-dashboard)
- [Quick Start](#quick-start)
- [Comparison With Alternatives](#comparison-with-alternatives)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Community and Support](#community-and-support)
- [License](#license)

## Key Features

- **Comment system** - threaded replies, mentions, votes, customizable UI-elements, built-in moderation
- **Feeds** - filter entities by tags, content, custom metadata, follow relationships, timeframe or geography and sort by hot, top or controversial.
- **In‑app notifications** - auto-generated in-app notification for pre-defined events such as votes, mentions, follows and more. Configurable webhooks for further action, such as sending push-notifications.
- **Curated lists** - user generated collections and nested sub-collections of entities.
- **Follow graph** - one‑way follow relationships ready for social graphs.
- **Authentication** - easy user authentication with Sublay, or integration with an external user system.
- **Admin tools** - reporting, content moderation and user management.

All features come with backend APIs, typed SDKs and ready to use React and React Native components.

## Why Sublay

- **Save months of work** - plug in battle‑tested social primitives instead of reinventing them
- **Headless first** - bring your own auth and UI or use the included components
- **Full TypeScript stack** - the same types flow from database to client hooks
- **Self host (DIY) or cloud** - open‑source core plus an optional managed service for zero ops

## ![In Action](/assets/action-optimized.gif)

## Building Sublay: A Layered, API-Centric Approach

Sublay wasn’t built in a traditional API-first way, but it is definitely API-centric. From the beginning, it was designed so that everything is powered by a clean, consistent API. This approach has shaped the way developers use Sublay today, and it’s what makes the system flexible and extensible.

You can think of Sublay as having three core layers:

### 1. The API (Foundation)

The base layer of Sublay is its API. Everything the system can do, you can do through the API-whether it’s posting a comment, reporting content, creating a new entity, or updating a user profile. As long as you’re authenticated for routes that require authentication, all functionality is accessible. The API is fully documented in Sublay’s docs and can be used directly if you prefer working closer to the metal.

### 2. Libraries & SDKs (Developer Tools)

On top of the API, Sublay provides official libraries to simplify development. Currently, there are React and React Native libraries (supporting both CLI and Expo), with Node.js and vanilla JS SDKs coming soon for both server and client environments.

These libraries handle communication with the API and offer helpful abstractions for things like authentication, request state, pagination, and cache. For example, hooks like `useEntityList` make it easy to fetch entities with filters, sorting, and pagination-without writing any boilerplate yourself.

### 3. Components (Plug & Play UI)

At the highest level, Sublay also offers prebuilt components that are fully wired up and ready to drop into your app. Components like `SocialCommentSection` use the underlying libraries and hooks to provide a complete UI and logic layer for features like commenting, voting, replying, and more. These are ideal for developers who want to move fast and not reinvent the wheel.

Combined, these three layers give developers everything they need to integrate Sublay fully: from low-level API access to high-level components ready to ship.

## Moderation with the Dashboard

One more critical part of the system is the Sublay Dashboard. While the three core layers handle the client experience, the dashboard is for product owners and moderators.

Through it, you can:

- Monitor all content created across your app
- Handle reports from users
- Remove inappropriate content
- Suspend or ban users

This separation ensures developers get the flexibility they want, while still giving teams the control and oversight they need to keep communities healthy and productive.

## Quick Start

This is a minimal example for integrating **comments** using Sublay. It’s meant as a basic demonstration with dummy content. Sublay offers much more - but this is the simplest way to get started.

To use this example:

1. **Create a new project** in the [Sublay dashboard](https://dash.sublay.io) and copy your project ID.
2. Go to **Settings → Secrets**, and **generate a new JWT key**. This is required for signing JWT tokens of your users data, when integrating Sublay with an external user system as we will mock in this example.
3. Install the required packages:

```bash
pnpm add @sublay/comments-social-react-js @sublay/react-js
```

> ⚠️ This example uses a helper function that signs a JWT with the user’s info using a your project's secret key. It is **meant only for development and testing**. Never expose private keys in production, and if using the function - rotate your keys before moving to production.

### Example `App.tsx`

Here’s how your app might look in a Vite + Tailwind project:

```tsx
import { SocialCommentSection } from "@sublay/comments-social-react-js";
import {
  EntityProvider,
  SublayProvider,
  useSignTestingJwt,
} from "@sublay/react-js";
import { useEffect, useState } from "react";

const PROJECT_ID = import.meta.env.VITE_PUBLIC_SUBLAY_PROJECT_ID;
const PRIVATE_KEY = import.meta.env.VITE_PUBLIC_SUBLAY_SECRET_KEY;

const DUMMY_USER = { id: "user1", username: "lionel_messi10" };
const DUMMY_POST = {
  id: "post_1234",
  title: "Sublay Demo",
  content: "Adding comment sections has never been so easy!",
};

function SingleItem({
  post,
}: {
  post: {
    id: string;
    title: string;
    content: string;
  };
}) {
  return (
    <div className="h-screen p-24">
      <div className="w-full max-w-4xl h-full rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-lg">{post.title}</h3>
          <p>{post.content}</p>
        </div>
        <div className="relative flex-1 flex flex-col pt-4">
          <SocialCommentSection />
        </div>
      </div>
    </div>
  );
}

function App() {
  const signTestingJwt = useSignTestingJwt();

  const [signedToken, setSignedToken] = useState<string>();

  useEffect(() => {
    const handleSignJwt = async () => {
      const token = await signTestingJwt({
        projectId: PROJECT_ID,
        privateKey: PRIVATE_KEY,
        payload: DUMMY_USER,
      });
      setSignedToken(token);
    };

    handleSignJwt();
  }, []);

  return (
    <SublayProvider projectId={PROJECT_ID} signedToken={signedToken}>
      <EntityProvider foreignId={DUMMY_POST.id} createIfNotFound>
        <SingleItem post={DUMMY_POST} />
      </EntityProvider>
    </SublayProvider>
  );
}

export default App;
```

## Comparison With Alternatives

|                        | **Sublay** | Disqus        | Supabase + DIY | Custom Build |
| ---------------------- | ----------- | ------------- | -------------- | ------------ |
| Open source            | ✔           | ✖             | ✔              | -            |
| Full social toolkit    | ✔           | Comments only | ✖              | -            |
| Self host              | ✔ (DIY)     | Limited       | ✔              | ✔            |
| React hooks & ready UI | ✔           | ✖             | ✖              | -            |

## Documentation

Full API reference, guides and recipes live at **[https://docs.sublay.io](https://docs.sublay.io)**.

## Contributing

Bug reports are welcome. contributing guide coming soon - [Join Discord server for updates.](https://discord.gg/REKxnCJzPz)

<!-- ---
1. Read the [contributing guide](CONTRIBUTING.md)
2. Pick an issue or open a discussion
3. Run `pnpm test` before pushing

Good first issues are tagged with **good first issue**. -->

## Community and Support

- **Discord** - [https://discord.gg/REKxnCJzPz](https://discord.gg/REKxnCJzPz)
- **Blog** - [https://blog.sublay.io](https://blog.sublay.io)

- **X/Twitter**
  - Sublay - [https://x.com/yantsab](https://x.com/yantsab)
  - Yanay (Developer) - [https://x.com/yantsab](https://x.com/yantsab)
- **LinkedIn**

  - Sublay - [https://www.linkedin.com/company/sublay](https://www.linkedin.com/company/sublay)
  - Yanay (Developer) - [https://www.linkedin.com/in/yanay-zabary/](https://www.linkedin.com/in/yanay-zabary/)

- **Email** - [support@sublay.io](mailto:support@sublay.io)

## License

Licensed under [Apache License, Version 2.0](https://www.apache.org/licenses/LICENSE-2.0).