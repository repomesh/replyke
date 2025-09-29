import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { AuthUser } from "../../interfaces/models/User";
import useUser from "../user/useUser";

export type UpdateUserParams = {
  name?: string | null;
  username?: string | null;
  avatar?: string | null;
  bio?: string;
  birthdate?: Date | null;
  location?: {
    latitude: number;
    longitude: number;
  } | null;
  metadata?: Record<string, any>;
  secureMetadata?: Record<string, any>;
};

function useUpdateUser() {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();
  const { user } = useUser();

  const updateUser = useCallback(
    async ({ update }: { update: UpdateUserParams }) => {
      if (!projectId) {
        throw new Error("No project specified");
      }

      if (!user) {
        throw new Error("No user is logged in.");
      }

      if (!update || Object.keys(update).length == 0) {
        console.error("Update object is empty");
      }

      const response = await axios.patch(
        `/${projectId}/users/${user.id}`,
        {
          update,
        },
        { withCredentials: true }
      );

      return response.data as AuthUser;
    },
    [projectId, axios]
  );

  return updateUser;
}

export default useUpdateUser;
