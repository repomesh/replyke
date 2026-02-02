import { useCallback } from "react";
import useProject from "../../projects/useProject";
import { Rule } from "../../../interfaces/models/Rule";
import useAxiosPrivate from "../../../config/useAxiosPrivate";

export interface CreateRuleProps {
  spaceId: string;
  title: string;
  description?: string | null;
}

function useCreateRule() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const createRule = useCallback(
    async ({ spaceId, title, description }: CreateRuleProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      if (!title) {
        throw new Error("Rule title is required");
      }

      const response = await axios.post(
        `/${projectId}/spaces/${spaceId}/rules`,
        {
          title,
          description: description || null,
        }
      );

      return response.data as Rule;
    },
    [projectId, axios]
  );

  return createRule;
}

export default useCreateRule;
