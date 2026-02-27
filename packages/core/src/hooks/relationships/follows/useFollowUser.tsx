import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";

export interface FollowUserProps {
  userId: string;
}

function useFollowUser(): (props: FollowUserProps) => Promise<void> {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const followUser = useCallback(
    async (props: FollowUserProps) => {
      const { userId } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!userId) {
        throw new Error("No user ID was provided");
      }

      await axios.post(
        `/${projectId}/users/${userId}/follow`,
        {}
      );
    },
    [axios, projectId]
  );

  return followUser;
}

export default useFollowUser;
