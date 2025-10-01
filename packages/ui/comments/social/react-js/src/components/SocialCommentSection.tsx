import React from "react";
import {
  SocialStyleCallbacks,
  useSocialStyle,
  PartialSocialStyleConfig,
} from "@replyke/comments-social-core";
import { Entity } from "@replyke/react-js";
import useSocialComments from "../hooks/useSocialComments";
import { deepEqual, warnPropChanges } from "../utils/propComparison";

type ButtonStyle = {
  backgroundColor: string;
  padding: string;
  borderRadius: string;
  color: string;
  fontSize: string;
};

type ButtonStyles = {
  active?: ButtonStyle;
  inactive?: ButtonStyle;
};

interface SocialCommentSectionProps {
  entity?: Entity | undefined | null;
  entityId?: string | undefined | null;
  foreignId?: string | undefined | null;
  shortId?: string | undefined | null;
  callbacks?: SocialStyleCallbacks;
  styleConfig?: Partial<
    PartialSocialStyleConfig & { sortByStyleConfig: ButtonStyles }
  >;
  isVisible?: boolean;
  sortOptions?: Array<"top" | "new" | "old"> | null;
  header?: React.ReactNode;
  withEmojis?: boolean;
  highlightedCommentId?: string | undefined | null;
  children?: React.ReactNode;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: SocialCommentSectionProps,
  nextProps: SocialCommentSectionProps
): boolean => {
  // Add development warnings for unnecessary prop changes
  warnPropChanges("SocialCommentSection", prevProps, nextProps, [
    "entity",
    "callbacks",
    "styleConfig",
  ]);

  // Compare primitive values
  if (
    prevProps.entityId !== nextProps.entityId ||
    prevProps.foreignId !== nextProps.foreignId ||
    prevProps.shortId !== nextProps.shortId ||
    prevProps.isVisible !== nextProps.isVisible ||
    prevProps.withEmojis !== nextProps.withEmojis ||
    prevProps.highlightedCommentId !== nextProps.highlightedCommentId
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

  // Compare sortOptions array
  if (!deepEqual(prevProps.sortOptions, nextProps.sortOptions)) {
    return false;
  }

  // Compare header and children (reference comparison for React nodes)
  if (prevProps.header !== nextProps.header) {
    return false;
  }

  if (prevProps.children !== nextProps.children) {
    return false;
  }

  return true;
};

function SocialCommentSection({
  entity,
  entityId,
  foreignId,
  shortId,
  callbacks,
  styleConfig: styleConfigProp,
  isVisible = true,
  sortOptions = ["top", "new", "old"],
  header,
  withEmojis,
  highlightedCommentId,
  children,
}: SocialCommentSectionProps) {
  const styleConfig = useSocialStyle(styleConfigProp);

  const { CommentSectionProvider, SortByButton, CommentsFeed, NewCommentForm } =
    useSocialComments({
      entity,
      entityId,
      foreignId,
      shortId,
      styleConfig,
      callbacks,
      highlightedCommentId,
    });

  const buttonStyles = {
    active: {
      backgroundColor: "black",
      padding: "4px 8px",
      borderRadius: "6px",
      color: "white",
      fontSize: "12px",
      ...(styleConfigProp?.sortByStyleConfig?.active ?? {}),
    },
    inactive: {
      backgroundColor: "#e5e7eb",
      padding: "4px 8px",
      borderRadius: "6px",
      fontSize: "12px",
      ...(styleConfigProp?.sortByStyleConfig?.inactive ?? {}),
    },
  };

  const renderSortButtons = () => {
    if (!sortOptions) return null;

    const optionsMap: Record<
      "top" | "new" | "old",
      { label: string; priority: "top" | "new" | "old" }
    > = {
      top: { label: "Top", priority: "top" },
      new: { label: "New", priority: "new" },
      old: { label: "Old", priority: "old" },
    };

    return sortOptions.map((option) => {
      const { label, priority } = optionsMap[option];
      return (
        <SortByButton
          key={priority}
          priority={priority}
          activeView={<div style={buttonStyles.active}>{label}</div>}
          nonActiveView={<div style={buttonStyles.inactive}>{label}</div>}
        />
      );
    });
  };

  return (
    <CommentSectionProvider>
      <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {(header || sortOptions) && (
          <div
            style={{
              display: "flex",
              paddingLeft: "24px",
              paddingRight: "24px",
              paddingTop: "12px",
              paddingBottom: "12px",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <div style={{ flex: 1 }}>{header}</div>
            {sortOptions !== null && renderSortButtons()}
          </div>
        )}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            backgroundColor: "white",
          }}
        >
          <CommentsFeed>{children}</CommentsFeed>
        </div>

        <div style={{ borderTop: "1px solid #e5e7eb" }}>
          {isVisible && <NewCommentForm withEmojis={withEmojis} />}
        </div>
      </div>
    </CommentSectionProvider>
  );
}

export default React.memo(SocialCommentSection, arePropsEqual);
