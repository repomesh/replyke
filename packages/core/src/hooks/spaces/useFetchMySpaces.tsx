import { useCallback } from "react";
import useProject from "../projects/useProject";
import { Space } from "../../interfaces/models/Space";
import axios from "../../config/axios";

function useFetchMySpaces() {
  const { projectId } = useProject();

  const fetchMySpaces = useCallback(async () => {
    if (!projectId) {
      throw new Error("No projectId available.");
    }

    const response = await axios.get(`/${projectId}/spaces/my-spaces`);

    return response.data as Space[];
  }, [projectId]);

  return fetchMySpaces;
}

export default useFetchMySpaces;
