import { useCallback } from "react";
import { Reaction, ReactionType } from "../../interfaces/models/Reaction";
import { PaginatedResponse } from "../../interfaces/IPaginatedResponse";
import useProject from "../projects/useProject";
import axios from "../../config/axios";

function useFetchEntityReactions() {
  const { projectId } = useProject();

  const fetchEntityReactions = useCallback(
    async (props: {
      entityId: string;
      page: number;
      limit?: number;
      reactionType?: ReactionType;
      sortDir?: "asc" | "desc";
    }): Promise<PaginatedResponse<Reaction>> => {
      const { entityId, page, limit = 20, reactionType, sortDir = "desc" } = props;

      if (page === 0) {
        throw new Error("Can't fetch reactions with page 0");
      }

      if (limit === 0) {
        throw new Error("Can't fetch with limit 0");
      }

      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!entityId) {
        throw new Error("No entity ID provided");
      }

      const params: Record<string, any> = {
        page,
        limit,
        sortDir,
      };

      if (reactionType) {
        params.reactionType = reactionType;
      }

      const response = await axios.get<PaginatedResponse<Reaction>>(
        `/${projectId}/v7/entities/${entityId}/reactions`,
        { params }
      );

      return response.data;
    },
    [projectId]
  );

  return fetchEntityReactions;
}

export default useFetchEntityReactions;
