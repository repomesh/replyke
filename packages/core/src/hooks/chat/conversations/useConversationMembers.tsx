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
          `/${projectId}/v7/chat/conversations/${conversationId}/members`,
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
          `/${projectId}/v7/chat/conversations/${conversationId}/members`,
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
          `/${projectId}/v7/chat/conversations/${conversationId}/members/${userId}`
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
        `/${projectId}/v7/chat/conversations/${conversationId}/leave`
      );
    } catch (err) {
      handleError(err, "Failed to leave conversation");
      throw err;
    }
  }, [projectId, conversationId, axios]);

  const changeRole = useCallback(
    async (userId: string, role: "admin" | "member") => {
      if (!projectId || !conversationId) return;
      try {
        const response = await axios.patch(
          `/${projectId}/v7/chat/conversations/${conversationId}/members/${userId}/role`,
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

  return { members, loading, addMember, removeMember, leave, changeRole };
}

export default useConversationMembers;
