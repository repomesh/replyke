import { useCallback, useEffect, useState } from "react";
import { IConversationMember } from "../../../interfaces/models/IConversationMember";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface UseConversationMembersProps {
  conversationId: string;
}

export interface UseConversationMembersValues {
  members: IConversationMember[];
  loading: boolean;
  addMember: (userId: string) => Promise<void>;
  removeMember: (userId: string) => Promise<void>;
  leave: () => Promise<void>;
  changeRole: (userId: string, role: "admin" | "member") => Promise<void>;
  /** Upsert a member into the local list (for real-time socket updates). */
  upsertMember: (member: IConversationMember) => void;
  /** Remove a member from the local list by userId (for real-time socket updates). */
  removeMemberLocally: (userId: string) => void;
}

function useConversationMembers({
  conversationId,
}: UseConversationMembersProps): UseConversationMembersValues {
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const [members, setMembers] = useState<IConversationMember[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !conversationId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/${projectId}/chat/conversations/${conversationId}/members`,
          { params: { limit: 100 } }
        );
        setMembers(response.data.data as IConversationMember[]);
      } catch (err) {
        handleError(err, "Failed to load conversation members");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [projectId, conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const addMember = useCallback(
    async (userId: string) => {
      if (!projectId || !conversationId) return;
      try {
        const response = await axios.post(
          `/${projectId}/chat/conversations/${conversationId}/members`,
          { userId }
        );
        const newMember = response.data as IConversationMember;
        setMembers((prev) => {
          // Replace existing entry or append
          const idx = prev.findIndex((m) => m.userId === newMember.userId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = newMember;
            return next;
          }
          return [...prev, newMember];
        });
      } catch (err) {
        handleError(err, "Failed to add member");
        throw err;
      }
    },
    [projectId, conversationId, axios]
  );

  const removeMember = useCallback(
    async (userId: string) => {
      if (!projectId || !conversationId) return;
      try {
        await axios.delete(
          `/${projectId}/chat/conversations/${conversationId}/members/${userId}`
        );
        setMembers((prev) => prev.filter((m) => m.userId !== userId));
      } catch (err) {
        handleError(err, "Failed to remove member");
        throw err;
      }
    },
    [projectId, conversationId, axios]
  );

  const leave = useCallback(async () => {
    if (!projectId || !conversationId) return;
    try {
      await axios.delete(
        `/${projectId}/chat/conversations/${conversationId}/leave`
      );
    } catch (err) {
      handleError(err, "Failed to leave conversation");
      throw err;
    }
  }, [projectId, conversationId, axios]);

  const upsertMember = useCallback((member: IConversationMember) => {
    setMembers((prev) => {
      const idx = prev.findIndex((m) => m.userId === member.userId);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = member;
        return next;
      }
      return [...prev, member];
    });
  }, []);

  const removeMemberLocally = useCallback((userId: string) => {
    setMembers((prev) => prev.filter((m) => m.userId !== userId));
  }, []);

  const changeRole = useCallback(
    async (userId: string, role: "admin" | "member") => {
      if (!projectId || !conversationId) return;
      try {
        const response = await axios.patch(
          `/${projectId}/chat/conversations/${conversationId}/members/${userId}/role`,
          { role }
        );
        const updated = response.data as IConversationMember;
        setMembers((prev) => {
          const idx = prev.findIndex((m) => m.userId === userId);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = updated;
            return next;
          }
          return prev;
        });
      } catch (err) {
        handleError(err, "Failed to change member role");
        throw err;
      }
    },
    [projectId, conversationId, axios]
  );

  return { members, loading, addMember, removeMember, leave, changeRole, upsertMember, removeMemberLocally };
}

export default useConversationMembers;
