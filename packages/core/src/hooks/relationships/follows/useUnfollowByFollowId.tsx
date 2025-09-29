import { useCallback } from "react";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { useUser } from "../../user";

function useUnfollowByFollowId() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const unfollowByFollowId = useCallback(
    async (props: { followId: string }) => {
      const { followId } = props;
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in");
      }

      if (!followId) {
        throw new Error("No follow ID was provided");
      }

      await axios.delete(`/${projectId}/follows/${followId}`, {
        withCredentials: true,
      });
    },
    [axios, projectId, user]
  );

  return unfollowByFollowId;
}

export default useUnfollowByFollowId;
