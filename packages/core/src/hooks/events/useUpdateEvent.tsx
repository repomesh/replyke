import { useCallback } from "react";
import useAxiosPrivate from "../../config/useAxiosPrivate";
import useProject from "../projects/useProject";
import { Event, EventType, EventVisibility } from "../../interfaces/models/Event";

export interface UpdateEventProps {
  eventId: string;
  update: {
    title?: string;
    description?: string;
    startTime?: string; // ISO datetime
    endTime?: string; // ISO datetime
    timezone?: string;
    type?: EventType;
    url?: string;
    venueName?: string;
    address?: string;
    location?: {
      latitude: number;
      longitude: number;
    };
    visibility?: EventVisibility;
    capacity?: number;
    allowMaybe?: boolean;
    guestListVisible?: boolean;
    metadata?: Record<string, any>;
  };
}

function useUpdateEvent(): (props: UpdateEventProps) => Promise<Event> {
  const axios = useAxiosPrivate();
  const { projectId } = useProject();

  const updateEvent = useCallback(
    async ({ eventId, update }: UpdateEventProps) => {
      if (!projectId) {
        throw new Error("No projectId available.");
      }

      const response = await axios.patch(
        `/${projectId}/events/${eventId}`,
        update
      );

      return response.data as Event;
    },
    [projectId, axios]
  );

  return updateEvent;
}

export default useUpdateEvent;
