import { useState, useEffect } from "react";
import { Comment as CommentType, useCommentSection } from "@replyke/react-js";
import { UserAvatar } from "@replyke/ui-core-react-js";
import VoteButtons from "./VoteButtons";
import ActionMenu from "./ActionMenu";
import NewReplyForm from "./NewReplyForm";
import useModalManager from "../../../hooks/useModalManager";

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
  const { deleteComment } = useCommentSection();
  const [showReplyForm, setShowReplyForm] = useState(false);

  const maxDepth = 6; // Limit visual nesting depth
  const actualDepth = Math.min(depth, maxDepth);

  // Calculate progressive indentation using inline styles for reliability
  const indentationPx = actualDepth * 24; // 40px per level (same as ml-10 = 2.5rem = 40px)

  return (
    <div
      style={{
        position: "relative",
        marginBottom: "8px",
        marginLeft: `${indentationPx}px`,
      }}
    >
      {/* Threading lines - positioned behind avatars, relative to indentation */}
      {actualDepth > 0 && (
        <>
          {/* Vertical line from parent thread continuing down - only if not the last reply */}
          {!isLastReply && (
            <div
              style={{
                position: "absolute",
                width: "1px",
                backgroundColor: "#D1D5DB",
                zIndex: 0,
                left: "-12px",
                top: "0px",
                height: "100%",
              }}
            ></div>
          )}

          {/* Vertical line from parent thread to this comment's branch point */}
          <div
            style={{
              position: "absolute",
              top: "-8px",
              width: "1px",
              height: "18px",
              backgroundColor: "#D1D5DB",
              zIndex: 0,
              left: "-12px",
            }}
          ></div>

          {/* Curved branch connecting parent line to child avatar */}
          <div
            style={{
              position: "absolute",
              top: "10px",
              width: "12px",
              height: "16px",
              borderLeft: "1.5px solid #D1D5DB",
              borderBottom: "1.5px solid #D1D5DB",
              borderTop: "1.5px solid transparent",
              borderRight: "1.5px solid transparent",
              borderBottomLeftRadius: "12px",
              zIndex: 0,
              left: "-12px",
            }}
          ></div>
        </>
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
                {/* {isCollapsed && hasReplies && (
                  <span className="text-blue-600 text-xs">
                    ({replyCount} {replyCount === 1 ? "reply" : "replies"})
                  </span>
                )} */}
                {hasReplies && (
                  <button
                    onClick={onToggleCollapse}
                    style={{
                      marginLeft: "4px",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#6B7280",
                      backgroundColor: "#F3F4F6",
                      borderRadius: "2px",
                      transition: "all 150ms ease-in-out",
                      fontSize: "14px",
                      fontWeight: "bold",
                      border: isCollapsed ? "1px solid #D1D5DB" : "none",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = "#374151";
                      e.currentTarget.style.backgroundColor = "#E5E7EB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = "#6B7280";
                      e.currentTarget.style.backgroundColor = "#F3F4F6";
                    }}
                    title={isCollapsed ? "Expand thread" : "Collapse thread"}
                  >
                    {isCollapsed ? "+" : "−"}
                  </button>
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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "12px",
                    }}
                  >
                    <button
                      onClick={() => setShowReplyForm((prev) => !prev)}
                      style={{
                        color: "#6B7280",
                        fontWeight: "500",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        marginLeft: "-8px",
                        transition: "all 150ms ease-in-out",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "#2563EB";
                        e.currentTarget.style.backgroundColor = "#EFF6FF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "#6B7280";
                        e.currentTarget.style.backgroundColor = "transparent";
                      }}
                    >
                      Reply
                    </button>
                    {hasReplies && (
                      <span style={{ color: "#9CA3AF" }}>
                        {replyCount} {replyCount === 1 ? "reply" : "replies"}
                      </span>
                    )}
                  </div>
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
