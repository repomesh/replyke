import { useCallback } from "react";
import useProject from "../../projects/useProject";
import { Rule } from "../../../interfaces/models/Rule";
import useAxiosPrivate from "../../../config/useAxiosPrivate";

export interface FetchRuleProps {
  spaceId: string;
  ruleId: string;
}

function useFetchRule(): (props: FetchRuleProps) => Promise<Rule> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const fetchRule = useCallback(
    async ({ spaceId, ruleId }: FetchRuleProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId) {
        throw new Error("Please pass a spaceId");
      }

      if (!ruleId) {
        throw new Error("Please pass a ruleId");
      }

      const response = await axios.get(
        `/${projectId}/spaces/${spaceId}/rules/${ruleId}`
      );

      return response.data as Rule;
    },
    [projectId, axios]
  );

  return fetchRule;
}

export default useFetchRule;
