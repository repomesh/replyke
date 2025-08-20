import React from "react";

function ReplyButtonAndInfo({
  hasReplies,
  replyCount,
  setShowReplyForm,
}: {
  hasReplies: boolean;
  replyCount: number;
  setShowReplyForm: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
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
  );
}

export default ReplyButtonAndInfo;
