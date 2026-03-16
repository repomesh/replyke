import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { handleError } from "../../utils/handleError";

export interface ReportMessageParams {
  conversationId: string;
  messageId: string;
  reason?: string;
  details?: string;
}

function useReportMessage(): (params: ReportMessageParams) => Promise<void> {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const report = useCallback(
    async ({
      conversationId,
      messageId,
      reason,
      details,
    }: ReportMessageParams): Promise<void> => {
      if (!projectId) throw new Error("No projectId available.");

      try {
        await axios.post(
          `/${projectId}/v7/chat/conversations/${conversationId}/messages/${messageId}/report`,
          { reason, details }
        );
      } catch (err) {
        handleError(err, "Failed to report message");
        throw err;
      }
    },
    [projectId, axios]
  );

  return report;
}

export default useReportMessage;
