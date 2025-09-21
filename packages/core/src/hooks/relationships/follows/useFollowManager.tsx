import { useState, useEffect, useCallback } from "react";
import useFollowUser from "./useFollowUser";
import useUnfollowUser from "./useUnfollowUser";
import useFetchFollow from "./useFetchFollow";
import useUser from "../../user/useUser";

interface UseFollowToggleProps {
  userId: string;
}

function useFollowManager({ userId }: UseFollowToggleProps) {
  const { user } = useUser();

  const [isFollowing, setIsFollowing] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const followUser = useFollowUser();
  const unfollowUser = useUnfollowUser();
  const fetchFollow = useFetchFollow();

  useEffect(() => {
    const loadFollowStatus = async () => {
      try {
        setIsLoading(true);
        const result = await fetchFollow({ userId });
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
  }, [userId, fetchFollow]);

  const toggleFollow = useCallback(async () => {
    if (isFollowing === null || isLoading || user?.id === userId) return;

    try {
      if (isFollowing) {
        await unfollowUser({ userId });
        setIsFollowing(false);
      } else {
        await followUser({ userId });
        setIsFollowing(true);
      }
    } catch (error) {
      console.error("Failed to toggle follow status:", error);
    }
  }, [isFollowing, isLoading, userId, followUser, unfollowUser]);

  return {
    isFollowing,
    isLoading,
    toggleFollow,
  };
}

export default useFollowManager;
