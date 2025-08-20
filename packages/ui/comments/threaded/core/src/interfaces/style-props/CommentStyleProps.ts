import { FontWeight } from "@replyke/ui-core";

export interface CommentStyleProps {
  // Spacing and layout
  horizontalItemsGap: number;        // Gap between horizontal items
  verticalItemsGap: number;          // Gap between vertical items
  
  // Avatar styling
  authorAvatarSize: number;          // Size of the author's avatar
  
  // Typography - Author
  authorFontSize: number;            // Font size for the author's name
  authorFontWeight: FontWeight;      // Font weight for the author's name
  authorFontColor: string;           // Font color for the author's name
  
  // Typography - Timestamp
  fromNowFontSize: number;           // Font size for the timestamp
  fromNowFontColor: string;          // Font color for the timestamp
  
  // Typography - Comment body
  commentBodyFontSize: number;       // Font size for the comment text
  commentBodyFontColor: string;      // Font color for the comment text
  
  // Actions and reply button
  actionsItemGap: number;            // Gap between action items
  replyButtonFontSize: number;       // Font size for the reply button
  replyButtonFontWeight: FontWeight; // Font weight for the reply button
  replyButtonFontColor: string;      // Font color for the reply button
  
  // Vote system
  voteIconSize: number;              // Size of vote icons (up/down arrows)
  upvoteColor: string;               // Color for upvote when active
  upvoteHoverColor: string;          // Background color for upvote on hover
  downvoteColor: string;             // Color for downvote when active
  downvoteHoverColor: string;        // Background color for downvote on hover
  voteContainerBackground: string;   // Background color for vote button container
  neutralVoteColor: string;          // Color for inactive vote buttons
  
  // Score display
  scoreTextSize: number;             // Font size for the score text
  scoreTextWeight: FontWeight;       // Font weight for the score text
  scoreTextColor: string;            // Font color for neutral score
  positiveScoreColor: string;        // Font color for positive score
  negativeScoreColor: string;        // Font color for negative score
  
  // Threading lines
  threadingLineColor: string;        // Color for threading lines
  
  // Reply sections
  repliesGap: number;                // Gap between replies
  repliesPaddingTop: number;         // Padding above replies section
  viewRepliesPaddingTop: number;     // Padding above "view replies" text
  
  // Text labels
  viewMoreRepliesText: string;       // Text for "view more replies" action
  hideRepliesText: string;           // Text for "hide replies" action
  justNowText: string;               // Text to display for very recent comments
}
