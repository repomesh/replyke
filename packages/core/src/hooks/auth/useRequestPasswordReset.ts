import { useCallback } from "react";
import axios from "../../config/axios";
import useProject from "../projects/useProject";

export interface RequestPasswordResetProps {
  email: string;
}

function useRequestPasswordReset(): (props: RequestPasswordResetProps) => Promise<{ success: boolean; message: string }> {
  const { projectId } = useProject();

  const requestPasswordReset = useCallback(
    async ({ email }: RequestPasswordResetProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!email?.trim()) {
        throw new Error("Email is required.");
      }

      const response = await axios.post(
        `/${projectId}/auth/request-password-reset`,
        { email: email.trim() }
      );

      return response.data;
    },
    [projectId]
  );

  return requestPasswordReset;
}

export default useRequestPasswordReset;
