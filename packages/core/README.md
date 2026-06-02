# Sublay Core

> **Note:** It is recommended to use the framework-specific package instead of this core package. Use `@sublay/react`, `@sublay/react-native`, or `@sublay/expo` for better integration, as they include `@sublay/core` under the hood.

## Overview

Sublay Core is the foundational package that powers the Sublay platform, providing developers with an easy-to-integrate solution for adding social and interactive features to their applications. It includes all the core client functionality needed to interact with Sublay’s backend services, allowing for seamless authentication, entity management, commenting, voting, notifications, and more.

This package is designed to be flexible, efficient, and developer-friendly, offering powerful hooks and methods to streamline the integration process.

## Key Features

- **Authentication** – Secure user authentication with support for external user management systems.
- **Entities** – Create, update, delete, and manage content such as posts, products, or other user-generated items.
- **Comments** – Full-featured comment system with replies, voting, and user mentions.
- **Voting System** – Upvote/downvote functionality for both entities and comments.
- **Entity Lists** – Fetch and display dynamic feeds with various filtering and sorting options.
- **Lists** – Enable users to create collections of entities, including nested sublists.
- **Reporting** – Allow users to report inappropriate content, enhancing moderation.
- **App Notifications** – Generate in-app notifications for key user actions.
- **Follows** – Establish follow relationships between users to build social connections.

## Why Use Sublay Core?

Sublay Core eliminates the complexity of building essential social features from scratch. Instead of developing authentication, feeds, comments, and notifications independently, developers can leverage Sublay’s streamlined API and prebuilt functionality, saving time and ensuring best practices in security and performance.

## Installation

Install the package via NPM:

```sh
npm install @sublay/core
```

## Documentation

Full documentation, including API references and integration guides, is available at [Sublay Documentation](https://docs.sublay.io).

## License

Sublay Core is licensed under the Apache 2.0 License.
