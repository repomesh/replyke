import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceMemberRole } from "../../interfaces/models/SpaceMember";
import { UpdateMemberRoleResponse } from "../../interfaces/models/Space";
import useAxiosPrivate from "../../config/useAxiosPrivate";

export interface UpdateMemberRoleProps {
  spaceId: string;
  memberId: string;
  role: SpaceMemberRole;
}

function useUpdateMemberRole() {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const updateMemberRole = useCallback(
    async ({ spaceId, memberId, role }: UpdateMemberRoleProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      if (!spaceId || !memberId || !role) {
        throw new Error("spaceId, memberId, and role are required");
      }

      const response = await axios.patch(
        `/${projectId}/spaces/${spaceId}/members/${memberId}/role`,
        { role }
      );

      return response.data as UpdateMemberRoleResponse;
    },
    [projectId]
  );

  return updateMemberRole;
}

export default useUpdateMemberRole;
