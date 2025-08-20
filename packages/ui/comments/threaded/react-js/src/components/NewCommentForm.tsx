"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { useCommentSection, useUser, useMentions } from "@replyke/react-js";
import { useTextareaCursorIndicator } from "@replyke/ui-core-react-js";
import { useThreadedStyleConfig } from "@replyke/comments-threaded-core";
import { MentionSuggestions } from "./MentionSuggestions";

function NewCommentForm() {
  const { user } = useUser();
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createComment, callbacks } = useCommentSection();
  
  const { styleConfig } = useThreadedStyleConfig();
  const {
    backgroundColor,
    itemsGap,
    verticalPadding,
    paddingLeft,
    paddingRight,
    placeholderText,
    textareaTextSize,
    textareaTextColor,
    textareaBackgroundColor,
  } = styleConfig!.newCommentFormProps;

  const hasContent = content.trim().length > 0;

  const { cursorPosition, isSelectionActive } = useTextareaCursorIndicator({
    textAreaRef,
  });

  const {
    isMentionActive,
    loading,
    mentionSuggestions,
    handleMentionClick,
    mentions,
    addMention,
    resetMentions,
  } = useMentions({
    content: textAreaRef.current?.value || "",
    setContent: (value: string) => {
      if (textAreaRef.current) {
        textAreaRef.current.value = value;
        setContent(value);
      }
    },
    focus: () => textAreaRef.current?.focus(),
    cursorPosition,
    isSelectionActive,
  });

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    const textArea = textAreaRef.current;
    if (!textArea || !hasContent || isSubmitting) return;

    if (!user) {
      callbacks?.loginRequiredCallback();
      return;
    }

    const tempContent = textArea.value.trim();
    setIsSubmitting(true);
    
    try {
      await createComment?.({ content: tempContent, mentions });
      textArea.value = "";
      setContent("");
      resetMentions();
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [hasContent, isSubmitting, user, createComment, mentions, resetMentions, callbacks]);

  // Add keyboard event handler for Enter key
  useEffect(() => {
    const handleKeyDown = async (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.ctrlKey && !event.shiftKey) {
        event.preventDefault();
        handleSubmit();
      }
    };

    const textArea = textAreaRef.current;
    textArea?.addEventListener("keydown", handleKeyDown);

    return () => {
      textArea?.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleSubmit]);

  return (
    <form onSubmit={handleSubmit} style={{ position: "relative" }}>
      <MentionSuggestions
        isMentionActive={isMentionActive}
        isLoadingMentions={loading}
        mentionSuggestions={mentionSuggestions}
        handleMentionClick={handleMentionClick}
      />
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          backgroundColor: backgroundColor,
          borderRadius: "16px",
          border: `1px solid ${hasContent ? "#BFDBFE" : "#E5E7EB"}`,
          boxShadow: hasContent
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            : "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          transition: "all 300ms ease-in-out",
          padding: `${verticalPadding}px`,
        }}
        onMouseEnter={(e) => {
          if (!hasContent) {
            e.currentTarget.style.boxShadow =
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
          }
        }}
        onMouseLeave={(e) => {
          if (!hasContent) {
            e.currentTarget.style.boxShadow =
              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
          }
        }}
      >
        <textarea
          ref={textAreaRef}
          onChange={(e) => setContent(e.target.value)}
          placeholder={placeholderText}
          style={{
            flex: 1,
            padding: `${verticalPadding}px`,
            backgroundColor: textareaBackgroundColor,
            color: textareaTextColor,
            fontSize: `${textareaTextSize}px`,
            lineHeight: "1.625",
            outline: "none",
            resize: "none",
            border: "none",
          }}
          rows={2}
        />
        <button
          type="submit"
          disabled={!hasContent || isSubmitting}
          style={{
            flexShrink: 0,
            padding: `${verticalPadding}px`,
            borderRadius: "50%",
            backgroundColor:
              hasContent && !isSubmitting ? "#2563EB" : "#E5E7EB",
            color: hasContent && !isSubmitting ? "#FFFFFF" : "#9CA3AF",
            boxShadow:
              "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
            transition: "all 200ms ease-in-out",
            border: "none",
            cursor: !hasContent || isSubmitting ? "not-allowed" : "pointer",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (hasContent && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#1D4ED8";
              e.currentTarget.style.boxShadow =
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
            }
          }}
          onMouseLeave={(e) => {
            if (hasContent && !isSubmitting) {
              e.currentTarget.style.backgroundColor = "#2563EB";
              e.currentTarget.style.boxShadow =
                "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = "2px solid #3B82F6";
            e.currentTarget.style.outlineOffset = "2px";
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = "none";
            e.currentTarget.style.outlineOffset = "0";
          }}
        >
          <svg
            style={{
              height: `${textareaTextSize}px`,
              width: `${textareaTextSize}px`,
              transition: "transform 200ms ease-in-out",
              transform: hasContent ? "scale(1)" : "scale(1)",
            }}
            onMouseEnter={(e) => {
              if (hasContent) {
                e.currentTarget.style.transform = "scale(1.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (hasContent) {
                e.currentTarget.style.transform = "scale(1)";
              }
            }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}

export { NewCommentForm };
