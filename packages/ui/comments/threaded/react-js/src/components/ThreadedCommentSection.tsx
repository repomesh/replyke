import React from "react";
import {
  ThreadedStyleCallbacks,
  useThreadedStyle,
  PartialThreadedStyleConfig,
  useThreadedStyleConfig,
} from "@replyke/comments-threaded-core";
import { Entity } from "@replyke/react-js";
import useThreadedComments from "../hooks/useThreadedComments";
import { CommentsFeed } from "./CommentsFeed";
import { NewCommentForm } from "./NewCommentForm";
import { deepEqual, warnPropChanges } from "../utils/propComparison";

interface ThreadedCommentSectionProps {
  entity?: Entity | undefined | null;
  entityId?: string | undefined | null;
  foreignId?: string | undefined | null;
  shortId?: string | undefined | null;
  callbacks?: ThreadedStyleCallbacks;
  styleConfig?: Partial<PartialThreadedStyleConfig>;
  isVisible?: boolean;
  highlightedCommentId?: string | undefined | null;
  children?: React.ReactNode;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: ThreadedCommentSectionProps,
  nextProps: ThreadedCommentSectionProps
): boolean => {
  // Add development warnings for unnecessary prop changes
  warnPropChanges("ThreadedCommentSection", prevProps, nextProps, [
    "entity",
    "callbacks",
    "styleConfig",
  ]);

  // Compare primitive values
  if (
    prevProps.entityId !== nextProps.entityId ||
    prevProps.foreignId !== nextProps.foreignId ||
    prevProps.shortId !== nextProps.shortId ||
    prevProps.isVisible !== nextProps.isVisible
  ) {
    return false;
  }

  // Deep compare entity objects for more accurate comparison
  if (!deepEqual(prevProps.entity, nextProps.entity)) {
    return false;
  }

  // Deep compare callbacks and styleConfig to handle cases where
  // parent component creates new objects with same content
  if (!deepEqual(prevProps.callbacks, nextProps.callbacks)) {
    return false;
  }

  if (!deepEqual(prevProps.styleConfig, nextProps.styleConfig)) {
    return false;
  }

  return true;
};

function ThreadedCommentSectionInner({
  isVisible,
  children,
}: {
  isVisible: boolean;
  children?: React.ReactNode;
}) {
  const { styleConfig: resolvedStyleConfig } = useThreadedStyleConfig();

  const { backgroundColor } = resolvedStyleConfig!.commentFeedProps;
  const { verticalPadding } = resolvedStyleConfig!.newCommentFormProps;

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          backgroundColor: backgroundColor,
          paddingTop: `${verticalPadding}px`,
          paddingBottom: `${verticalPadding}px`,
        }}
      >
        <CommentsFeed>{children}</CommentsFeed>
      </div>

      <div
        style={{
          borderTop: "1px solid #e5e7eb",
          paddingTop: `${verticalPadding}px`,
        }}
      >
        {isVisible && <NewCommentForm />}
      </div>
    </div>
  );
}

function ThreadedCommentSection({
  entity,
  entityId,
  foreignId,
  shortId,
  callbacks,
  styleConfig: styleConfigProp,
  isVisible = true,
  highlightedCommentId,
  children,
}: ThreadedCommentSectionProps) {
  const styleConfig = useThreadedStyle(styleConfigProp);

  const { CommentSectionProvider } = useThreadedComments({
    entity,
    entityId,
    foreignId,
    shortId,
    styleConfig,
    callbacks,
    highlightedCommentId,
  });

  return (
    <CommentSectionProvider>
      <ThreadedCommentSectionInner isVisible={isVisible}>
        {children}
      </ThreadedCommentSectionInner>
    </CommentSectionProvider>
  );
}

export default React.memo(ThreadedCommentSection, arePropsEqual);
