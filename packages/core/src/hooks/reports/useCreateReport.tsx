import useAxiosPrivate from "../../config/useAxiosPrivate";
import { ReportReasonKey } from "../../constants/reportReasons";
import useProject from "../projects/useProject";
import { useUser } from "../user";

export interface UseCreateReportProps {
  type: "comment" | "entity";
}

export interface CreateReportProps {
  targetId: string;
  targetType: "comment" | "entity";
  reason: ReportReasonKey;
  details?: string;
}

export interface CreateCommentReportProps {
  targetId: string;
  reason: ReportReasonKey;
  details?: string;
}

export interface CreateEntityReportProps {
  targetId: string;
  reason: ReportReasonKey;
  details?: string;
}

function useCreateReport({ type }: UseCreateReportProps): ((props: CreateCommentReportProps) => Promise<void>) | ((props: CreateEntityReportProps) => Promise<void>) {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const createReport = async ({
    targetId,
    targetType,
    reason,
    details,
  }: CreateReportProps) => {
    if (!projectId) {
      throw new Error("Project ID is required");
    }

    if (!user) {
      throw new Error("No user is logged in");
    }

    await axios.post(
      `/${projectId}/reports`,
      {
        targetId,
        targetType,
        reason,
        details,
      },
    );
  };

  const createCommentReport = async ({
    targetId,
    reason,
    details,
  }: CreateCommentReportProps) => {
    await createReport({
      targetId,
      targetType: "comment",
      reason,
      details,
    });
  };

  const createEntityReport = async ({
    targetId,
    reason,
    details,
  }: CreateEntityReportProps) => {
    await createReport({
      targetId,
      targetType: "entity",
      reason,
      details,
    });
  };

  if (type === "comment") {
    return createCommentReport;
  } else if (type === "entity") {
    return createEntityReport;
  }

  throw new Error("Invalid report type");
}

export default useCreateReport;
