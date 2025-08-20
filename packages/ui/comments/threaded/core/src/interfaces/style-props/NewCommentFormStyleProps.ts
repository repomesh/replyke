import { FontWeight } from "@replyke/ui-core"

export type NewCommentFormStyleProps = {
  // Form container
  backgroundColor: string;          // Background color of the form
  itemsGap: number;                 // Gap between items in the form
  verticalPadding: number;          // Vertical padding inside the form
  paddingLeft: number;              // Left padding inside the form
  paddingRight: number;             // Right padding inside the form
  
  // Avatar (for consistency, though threaded comments don't typically show avatars in forms)
  withAvatar: boolean;              // Whether to show the user's avatar
  authorAvatarSize: number;         // Size of the user's avatar
  
  // Textarea styling
  placeholderText: string;          // Placeholder text for the input
  textareaTextSize: number;         // Font size of the textarea text
  textareaTextColor: string;        // Text color of the textarea text
  textareaBackgroundColor: string;  // Background color of the textarea
  
  // Submit button
  postButtonText: string;           // Text on the post button
  postButtonFontSize: number;       // Font size for the post button text
  postButtonFontWeight: FontWeight; // Font weight for the post button text
  postButtonFontColor: string;      // Font color for the post button text
};
