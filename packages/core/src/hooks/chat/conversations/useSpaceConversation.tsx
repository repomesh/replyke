import { useEffect, useState } from "react";
import { useReplykeDispatch } from "../../../store/hooks";
import { setConversation } from "../../../store/slices/chatSlice";
import { IConversation } from "../../../interfaces/models/IConversation";
import useAxiosPrivate from "../../../config/useAxiosPrivate";
import useProject from "../../projects/useProject";
import { handleError } from "../../../utils/handleError";

export interface UseSpaceConversationProps {
  spaceId: string;
}

export interface UseSpaceConversationValues {
  conversation: IConversation | null;
  loading: boolean;
}

function useSpaceConversation({
  spaceId,
}: UseSpaceConversationProps): UseSpaceConversationValues {
  const dispatch = useReplykeDispatch();
  const { projectId } = useProject();
  const axios = useAxiosPrivate();

  const [conversation, setLocalConversation] = useState<IConversation | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!projectId || !spaceId) return;

    const fetch = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `/${projectId}/chat/spaces/${spaceId}/conversation`
        );
        const data = response.data as IConversation;
        dispatch(setConversation(data));
        setLocalConversation(data);
      } catch (err) {
        handleError(err, "Failed to load space conversation");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [projectId, spaceId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { conversation, loading };
}

export default useSpaceConversation;
