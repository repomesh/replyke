import { useCallback } from "react";
import axios from "../../config/axios";
import useProject from "../projects/useProject";
import { useSublayDispatch } from "../../store/hooks";
import { updateUserOptimistic } from "../../store/slices/userSlice";

export interface VerifyEmailProps {
  token: string;
}

function useVerifyEmail(): (props: VerifyEmailProps) => Promise<{ success: boolean }> {
  const { projectId } = useProject();
  const dispatch = useSublayDispatch();

  const verifyEmail = useCallback(
    async ({ token }: VerifyEmailProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!token?.trim()) {
        throw new Error("Verification token is required.");
      }

      const response = await axios.post(`/${projectId}/auth/verify-email`, {
        token: token.trim(),
      });

      // Update local state immediately so the UI reflects the verified status
      dispatch(updateUserOptimistic({ isVerified: true }));

      return response.data;
    },
    [projectId, dispatch]
  );

  return verifyEmail;
}

export default useVerifyEmail;
