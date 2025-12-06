import { useCallback } from "react";
import useProject from "../projects/useProject";
import { SpaceMember, SpaceMemberRole } from "../../interfaces/models/SpaceMember";
import axios from "../../config/axios";

interface UpdateMemberRoleParams {
  spaceId: string;
  memberId: string;
  role: SpaceMemberRole;
}

function useUpdateMemberRole() {
  const { projectId } = useProject();

  const updateMemberRole = useCallback(
    async ({ spaceId, memberId, role }: UpdateMemberRoleParams) => {
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

      return response.data as SpaceMember;
    },
    [projectId]
  );

  return updateMemberRole;
}

export default useUpdateMemberRole;
