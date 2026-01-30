import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceTeamResponse } from "../../interfaces/models/SpaceMember";
import useAxiosPrivate from "../../config/useAxiosPrivate";

interface FetchSpaceTeamParams {
  spaceId: string;
}

// Fetches all admins and moderators of a space (no pagination)
function useFetchSpaceTeam() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchSpaceTeam = useCallback(
    async ({ spaceId }: FetchSpaceTeamParams) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      const url = `/${projectId}/spaces/${spaceId}/team`;

      const response = await axios.get<SpaceTeamResponse>(url);

      return response.data;
    },
    [projectId, axios]
  );

  return fetchSpaceTeam;
}

export default useFetchSpaceTeam;
