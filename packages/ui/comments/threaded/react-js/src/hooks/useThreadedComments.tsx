import { ReactNode, useMemo } from "react";
import {
  CommentsSortByOptions,
  CommentSectionProvider,
  Entity,
} from "@replyke/react-js";
import {
  ThreadedStyleCallbacks,
  ThreadedStyleConfig,
  ThreadedStyleConfigProvider,
} from "@replyke/comments-threaded-core";
import { CommentsFeed, NewCommentForm } from "../components";
import { CommentMenuModal } from "../components/modals/CommentMenuModal";
import { CommentMenuModalOwner } from "../components/modals/CommentMenuModalOwner";
import { ModalManagerProvider } from "../context/ModalManagerContext";

function useThreadedComments({
  entity,
  entityId,
  foreignId,
  shortId,
  createIfNotFound,
  styleConfig,
  callbacks,
  defaultSortBy,
  limit,
  highlightedCommentId,
}: {
  entity?: Entity | undefined | null;
  entityId?: string | undefined | null;
  foreignId?: string | undefined | null;
  shortId?: string | undefined | null;
  createIfNotFound?: boolean;
  styleConfig: ThreadedStyleConfig;
  callbacks?: ThreadedStyleCallbacks;
  defaultSortBy?: CommentsSortByOptions;
  limit?: number;
  highlightedCommentId?: string | null;
}) {
  const MemoizedCommentSectionProvider = useMemo(() => {
    return ({ children }: { children: ReactNode }) => (
      <CommentSectionProvider
        entity={entity}
        entityId={entityId}
        foreignId={foreignId}
        shortId={shortId}
        createIfNotFound={createIfNotFound}
        callbacks={callbacks}
        defaultSortBy={defaultSortBy}
        limit={limit}
        highlightedCommentId={highlightedCommentId}
      >
        <ThreadedStyleConfigProvider styleConfig={styleConfig}>
          <ModalManagerProvider>
            <>
              {children}
              <CommentMenuModal />
              <CommentMenuModalOwner />
            </>
          </ModalManagerProvider>
        </ThreadedStyleConfigProvider>
      </CommentSectionProvider>
    );
  }, [
    entity,
    entityId,
    foreignId,
    shortId,
    createIfNotFound,
    styleConfig,
    callbacks,
    defaultSortBy,
    limit,
    highlightedCommentId
  ]);

  return useMemo(() => ({
    CommentSectionProvider: MemoizedCommentSectionProvider,
    CommentsFeed,
    NewCommentForm,
  }), [MemoizedCommentSectionProvider]);
}

export default useThreadedComments;
