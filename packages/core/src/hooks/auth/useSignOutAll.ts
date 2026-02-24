import { useCallback } from "react";
import { useReplykeDispatch } from "../../store/hooks";
import { signOutAllThunk } from "../../store/slices/authThunks";
import useProject from "../projects/useProject";

export interface UseSignOutAllReturn {
  signOutAll: () => Promise<void>;
}

export default function useSignOutAll(): UseSignOutAllReturn {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();

  const signOutAll = useCallback(async () => {
    if (!projectId) {
      throw new Error("No projectId available.");
    }

    const result = await dispatch(signOutAllThunk({ projectId }));

    if (signOutAllThunk.rejected.match(result)) {
      throw new Error(result.payload as string);
    }
  }, [dispatch, projectId]);

  return { signOutAll };
}
