import { useState, useEffect, useCallback } from "react";
import useFollowUser from "./useFollowUser";
import useUnfollowUserByUserId from "./useUnfollowUserByUserId";
import useFetchFollowStatus from "./useFetchFollowStatus";
import useUser from "../../user/useUser";

interface UseFollowToggleProps {
  userId: string;
}

function useFollowManager({ userId }: UseFollowToggleProps) {
  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const followUser = useFollowUser();
  const unfollowUserByUserId = useUnfollowUserByUserId();
  const fetchFollowStatus = useFetchFollowStatus();

  useEffect(() => {
    const loadFollowStatus = async () => {
      try {
        setIsLoading(true);
        const result = await fetchFollowStatus({ userId });
        setIsFollowing(result.isFollowing);
      } catch (error) {
        console.error("Failed to fetch follow status:", error);
        setIsFollowing(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && user?.id !== userId) {
      loadFollowStatus();
    }
  }, [userId, fetchFollowStatus]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing === null || isLoading || user?.id === userId) return;

    try {
      if (isFollowing) {
        await unfollowUserByUserId({ userId });
        setIsFollowing(false);
      } else {
        await followUser({ userId });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
    }
  }, [isFollowing, isLoading, userId, followUser, unfollowUserByUserId]);

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}

export default useFollowManager;
