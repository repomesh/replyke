import { useState } from "react";
import { Comment as CommentType } from "@replyke/react-js";
import { UserAvatar } from "@replyke/ui-core-react-js";
import VoteButtons from "../VoteButtons";
import ActionMenu from "../ActionMenu";
import NewReplyForm from "../NewReplyForm";
import ToggleRepliesVisibilty from "./ToggleRepliesVisibilty";
import IndentationThreadingLines from "./IndentationThreadingLines";
import ReplyButtonAndInfo from "./ReplyButtonAndInfo";

interface SingleCommentProps {
  comment: CommentType;
  depth: number;
  hasReplies: boolean;
  isCollapsed: boolean;
  replyCount: number;
  isLastReply?: boolean;
  onToggleCollapse: () => void;
}

function SingleComment({
  comment: commentFromSection,
  depth,
  hasReplies,
  isCollapsed,
  replyCount,
  isLastReply = false,
  onToggleCollapse,
}: SingleCommentProps) {
  const [comment, setComment] = useState(commentFromSection);
  const [showReplyForm, setShowReplyForm] = useState(false);

  const maxDepth = 6; // Limit visual nesting depth
  const actualDepth = Math.min(depth, maxDepth);

  // Calculate progressive indentation using inline styles for reliability
  const indentationPx = actualDepth * 24; // 24px per level (same as ml-10 = 2.5rem = 40px)

  return (
    <div
      style={{
        position: "relative",
        // marginBottom: "8px",
        marginLeft: `${indentationPx}px`,
      }}
    >
      {/* Threading lines - positioned behind avatars, relative to indentation */}
      {actualDepth > 0 && (
        <IndentationThreadingLines isLastReply={isLastReply} />
      )}

      <div
        style={{
          padding: "8px 0",
          borderRadius: "6px",
          transition: "colors 150ms ease-in-out",
        }}
      >
        <div style={{ display: "flex" }}>
          {/* Avatar positioned for threading line connection with top margin */}
          <div
            style={{
              flexShrink: 0,
              marginRight: "12px",
              position: "relative",
              marginTop: "4px",
            }}
          >
            <div style={{ position: "relative", zIndex: 10 }}>
              <UserAvatar user={comment.user} borderRadius={24} size={24} />
            </div>
            {/* Vertical line extending down from this comment's avatar when it has replies */}
            {hasReplies && !isCollapsed && (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "20px",
                  width: "1px",
                  backgroundColor: "#D1D5DB",
                  zIndex: 0,
                  height: "calc(100% + 10px)",
                }}
              ></div>
            )}
          </div>

          {/* Comment content area */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "4px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  color: "#6B7280",
                }}
              >
                <span style={{ fontWeight: "500", color: "#374151" }}>
                  {comment.user?.name || "Anonymous"}
                </span>
                <span>•</span>
                <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                {isCollapsed && hasReplies && (
                  <span className="text-blue-600 text-xs">
                    ({replyCount} {replyCount === 1 ? "reply" : "replies"})
                  </span>
                )}
                {hasReplies && (
                  <ToggleRepliesVisibilty
                    isCollapsed={isCollapsed}
                    onToggleCollapse={onToggleCollapse}
                  />
                )}
              </div>
              <ActionMenu comment={comment} />
            </div>

            {!isCollapsed && (
              <>
                <p
                  style={{
                    fontSize: "12px",
                    color: "#1F2937",
                    marginBottom: "12px",
                    lineHeight: "1.625",
                  }}
                >
                  {comment.content}
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ReplyButtonAndInfo
                    hasReplies={hasReplies}
                    replyCount={replyCount}
                    setShowReplyForm={setShowReplyForm}
                  />
                  {/* Vote buttons inline with reply options */}
                  <div style={{ flexShrink: 0 }}>
                    <VoteButtons
                      comment={comment}
                      setComment={setComment}
                      size="small"
                    />
                  </div>
                </div>

                {/* Reply form */}
                {showReplyForm && (
                  <NewReplyForm
                    comment={comment}
                    setShowReplyForm={setShowReplyForm}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SingleComment;
