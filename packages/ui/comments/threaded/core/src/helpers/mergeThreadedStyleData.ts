import { safeMergeStyleProps } from "@replyke/ui-core";
import { threadedBaseStyle } from "../threaded-base-style";
import { CommentStyleProps } from "../interfaces/style-props/CommentStyleProps";
import { CommentFeedStyleProps } from "../interfaces/style-props/CommentFeedStyleProps";
import { NewCommentFormStyleProps } from "../interfaces/style-props/NewCommentFormStyleProps";
import { ThreadedStyleConfig } from "../interfaces/style-props/ThreadedStyleConfig";

export function mergeThreadedStyleData(
  commentFeedProps?: Partial<CommentFeedStyleProps>,
  commentProps?: Partial<CommentStyleProps>,
  newCommentFormProps?: Partial<NewCommentFormStyleProps>
): ThreadedStyleConfig {
  const mergedStyle = {
    type: threadedBaseStyle.type,
    commentFeedProps: safeMergeStyleProps(
      threadedBaseStyle.commentFeedProps,
      commentFeedProps
    ),
    commentProps: safeMergeStyleProps(
      threadedBaseStyle.commentProps,
      commentProps
    ),
    newCommentFormProps: safeMergeStyleProps(
      threadedBaseStyle.newCommentFormProps,
      newCommentFormProps
    ),
  };

  return mergedStyle;
}
