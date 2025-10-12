import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";

function useUnfollowUserByUserId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const unfollowUserByUserId = useCallback(
    async (props: { userId: string }) => {
      const { userId } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      if (!userId) {
        throw new Error("No user ID was provided");
      }

      if (userId === user.id) {
        throw new Error("Users can't unfollow themselves");
      }

      await axios.delete(`/${projectId}/users/${userId}/follow`, {
        withCredentials: true,
      });
    },
    [axios, projectId, user]
  );

  return unfollowUserByUserId;
}

export default useUnfollowUserByUserId;
