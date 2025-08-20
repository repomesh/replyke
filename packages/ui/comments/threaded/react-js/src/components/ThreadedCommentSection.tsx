import {
  ThreadedStyleCallbacks,
  useThreadedStyle,
  PartialThreadedStyleConfig,
} from "@replyke/comments-threaded-core";
import { Entity } from "@replyke/react-js";
import useThreadedComments from "../hooks/useThreadedComments";
import { CommentsFeed } from "./CommentsFeed";
import { NewCommentForm } from "./NewCommentForm";

function SocialCommentSection({
  entity,
  entityId,
  foreignId,
  shortId,
  callbacks,
  styleConfig: styleConfigProp,
  isVisible = true,
}: {
  entity?: Entity | undefined | null;
  entityId?: string | undefined | null;
  foreignId?: string | undefined | null;
  shortId?: string | undefined | null;
  callbacks?: ThreadedStyleCallbacks;
  styleConfig?: Partial<PartialThreadedStyleConfig>;
  isVisible?: boolean;
}) {
  const styleConfig = useThreadedStyle(styleConfigProp);

  const { CommentSectionProvider } = useThreadedComments({
    entity,
    entityId,
    foreignId,
    shortId,
    styleConfig,
    callbacks,
  });

  return (
    <CommentSectionProvider>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          <CommentsFeed />
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb" }}>
          {isVisible && <NewCommentForm />}
        </div>
      </div>
    </CommentSectionProvider>
  );
}

export default SocialCommentSection;
