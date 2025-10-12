import { useEffect, useState } from "react";
import { Comment } from "../../interfaces/models/Comment";
import { handleError } from "../../utils/handleError";
import useCommentSection from "./useCommentSection";
import useFetchManyComments from "./useFetchManyComments";
import { CommentsSortByOptions } from "../../interfaces/CommentsSortByOptions";

function useReplies({
  commentId,
  sortBy,
}: {
  commentId: string;
  sortBy: CommentsSortByOptions;
}) {
  const fetchManyComments = useFetchManyComments();
  const { addCommentsToTree, entityCommentsTree } = useCommentSection();

  const [page, setPage] = useState(0);
  const [loadingState, setLoadingState] = useState(false);

  const commentData = entityCommentsTree![commentId];
  if (!commentData) {
    return {
      replies: [],
      newReplies: [],
      loading: loadingState,
      page,
      setPage,
    }; // If the commentID is not found, return an empty array
  }

  const allReplies = commentData.replies;
  const replies = Object.values(allReplies).filter((reply) => !reply.new);

  const newReplies = Object.values(allReplies)
    .filter((reply) => !!reply.new)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  useEffect(() => {
    const loadReplies = async () => {
      if (!commentId) {
        // console.warn(
        //   "The 'fetch comments' operation was invoked without a valid comment ID and has been aborted."
        // );
        return;
      }

      try {
        setLoadingState(true);

        const fetchedReplies: Comment[] = await fetchManyComments({
          parentId: commentId,
          page,
          sortBy,
          limit: 5,
        });

        addCommentsToTree?.(fetchedReplies);
      } catch (err: unknown) {
        handleError(err, "Failed to fetch replies: ");
      } finally {
        setLoadingState(false);
      }
    };

    if (page > 0) {
      loadReplies();
    }
  }, [page]);

  return {
    replies,
    newReplies,
    loading: loadingState,
    page,
    setPage,
  };
}

export default useReplies;
