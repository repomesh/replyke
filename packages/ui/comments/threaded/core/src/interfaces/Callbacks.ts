export type ThreadedStyleCallbacks = {
  loginRequiredCallback?: () => void; // Executed when an un-authenticated user tries to interact with the comments (like/comment/reply). Defaults to a simple alert message.

  usernameRequiredCallback?: () => void; // What should happen when a user with no username tries to interact with the comments (like/comment/reply). Could be used to enforce usernames. (suggestion: enforce setting up a username in signup flow). If not passed, the action will be submitted and a generic username will be used in the UI (e.g. user-85h344).

  commentTooShortCallback?: () => void; // Wll be executed if the user tries to submit an empty comment/reply. Defaults to a simple alert message.

  currentUserClickCallback?: () => void; // What should happen when a user clicks their own avatar/name in the comment section (suggestion: direct them to their profile). Defaults to no action

  otherUserClickCallback?: (
    userId: string,
    userForeignId: string | null
  ) => void; // What should happen when a user clicks a different user's avatar/name/mention in the comment section (suggestion: direct them to that user's profile). Defaults to no action

  userCantBeMentionedCallback?: () => void; // What should happen when a user tries to mention another user but that other user has no username set, which is a pre-requisite to being mentioned. Defaults to basic alert message.s
};
