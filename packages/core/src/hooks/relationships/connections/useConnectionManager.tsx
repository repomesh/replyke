import { useState, useEffect, useCallback } from "react";
import useRequestConnection from "./useRequestConnection";
import useAcceptConnection from "./useAcceptConnection";
import useDeclineConnection from "./useDeclineConnection";
import useRemoveConnection from "./useRemoveConnection";
import useRemoveConnectionByUserId from "./useRemoveConnectionByUserId";
import useGetConnectionStatus from "./useFetchConnectionStatus";
import useUser from "../../user/useUser";
import {
  ConnectionStatus,
  ConnectionStatusResponse,
} from "../../../interfaces/models/Connection";

interface UseConnectionManagerProps {
  userId: string;
}

interface ConnectionData {
  connectionId: string | null;
  connectedAt?: string;
  requestedAt?: string;
  createdAt?: string;
  respondedAt?: string;
  type?: "sent" | "received";
}

function useConnectionManager({ userId }: UseConnectionManagerProps) {
  const { user } = useUser();

  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("none");
  const [connectionData, setConnectionData] = useState<ConnectionData>({
    connectionId: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  const requestConnection = useRequestConnection();
  const acceptConnection = useAcceptConnection();
  const declineConnection = useDeclineConnection();
  const removeConnection = useRemoveConnection();
  const removeConnectionByUserId = useRemoveConnectionByUserId();
  const getConnectionStatus = useGetConnectionStatus();

  const loadConnectionStatus = useCallback(async () => {
    if (!userId || user?.id === userId) {
      setConnectionStatus("none");
      setConnectionData({ connectionId: null });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const statusResponse: ConnectionStatusResponse =
        await getConnectionStatus({ userId });

      switch (statusResponse.status) {
        case "none":
          setConnectionStatus("none");
          setConnectionData({ connectionId: null });
          break;
        case "pending":
          setConnectionStatus(
            statusResponse.type === "sent" ? "pending-sent" : "pending-received"
          );
          setConnectionData({
            connectionId: statusResponse.connectionId,
            createdAt: statusResponse.createdAt,
            type: statusResponse.type,
          });
          break;
        case "connected":
          setConnectionStatus("connected");
          setConnectionData({
            connectionId: statusResponse.connectionId,
            connectedAt: statusResponse.connectedAt,
            requestedAt: statusResponse.requestedAt,
          });
          break;
        case "declined":
          setConnectionStatus(
            statusResponse.type === "sent" ? "declined-sent" : "declined-received"
          );
          setConnectionData({
            connectionId: statusResponse.connectionId,
            respondedAt: statusResponse.respondedAt,
            type: statusResponse.type,
          });
          break;
        default:
          setConnectionStatus("none");
          setConnectionData({ connectionId: null });
      }
    } catch (error) {
      console.error("Failed to fetch connection status:", error);
      setConnectionStatus("none");
      setConnectionData({ connectionId: null });
    } finally {
      setIsLoading(false);
    }
  }, [userId, user?.id, getConnectionStatus]);

  useEffect(() => {
    loadConnectionStatus();
  }, [loadConnectionStatus]);

  const sendConnectionRequest = useCallback(
    async (message?: string) => {
      if (
        (connectionStatus !== "none" && connectionStatus !== "declined-received") ||
        isLoading ||
        user?.id === userId
      )
        return;

      try {
        const result = await requestConnection({ userId, message });
        setConnectionStatus("pending-sent");
        setConnectionData({
          connectionId: result.id,
          type: "sent",
          createdAt: result.createdAt,
        });
      } catch (error) {
        console.error("Failed to send connection request:", error);
        throw error;
      }
    },
    [connectionStatus, isLoading, userId, user?.id, requestConnection]
  );

  const acceptConnectionRequest = useCallback(async () => {
    if (
      connectionStatus !== "pending-received" ||
      !connectionData.connectionId ||
      isLoading
    )
      return;

    try {
      await acceptConnection({
        connectionId: connectionData.connectionId,
      });
      setConnectionStatus("connected");
      // Reload to get the updated connection data with dates
      await loadConnectionStatus();
    } catch (error) {
      console.error("Failed to accept connection request:", error);
      throw error;
    }
  }, [
    connectionStatus,
    connectionData.connectionId,
    isLoading,
    acceptConnection,
    loadConnectionStatus,
  ]);

  const declineConnectionRequest = useCallback(async () => {
    if (
      connectionStatus !== "pending-received" ||
      !connectionData.connectionId ||
      isLoading
    )
      return;

    try {
      const result = await declineConnection({ connectionId: connectionData.connectionId });
      // When you decline someone, from your perspective it's "declined-received"
      // (you received and declined their request)
      setConnectionStatus("declined-received");
      setConnectionData({
        connectionId: connectionData.connectionId,
        respondedAt: result.respondedAt,
        type: "received",
      });
    } catch (error) {
      console.error("Failed to decline connection request:", error);
      throw error;
    }
  }, [
    connectionStatus,
    connectionData.connectionId,
    isLoading,
    declineConnection,
  ]);

  const withdrawConnectionRequest = useCallback(async () => {
    if (
      connectionStatus !== "pending-sent" ||
      !connectionData.connectionId ||
      isLoading
    )
      return;

    try {
      await removeConnection({ connectionId: connectionData.connectionId });
      setConnectionStatus("none");
      setConnectionData({ connectionId: null });
    } catch (error) {
      console.error("Failed to withdraw connection request:", error);
      throw error;
    }
  }, [
    connectionStatus,
    connectionData.connectionId,
    isLoading,
    removeConnection,
  ]);

  const disconnectUser = useCallback(async () => {
    if (
      connectionStatus !== "connected" ||
      !connectionData.connectionId ||
      isLoading
    )
      return;

    try {
      await removeConnection({ connectionId: connectionData.connectionId });
      setConnectionStatus("none");
      setConnectionData({ connectionId: null });
    } catch (error) {
      console.error("Failed to disconnect user:", error);
      throw error;
    }
  }, [
    connectionStatus,
    connectionData.connectionId,
    isLoading,
    removeConnection,
  ]);

  const removeConnectionSmart = useCallback(async () => {
    if (
      connectionStatus === "none" ||
      connectionStatus === "declined-sent" ||
      isLoading ||
      user?.id === userId
    )
      return;

    try {
      await removeConnectionByUserId({ userId });
      setConnectionStatus("none");
      setConnectionData({ connectionId: null });
    } catch (error) {
      console.error("Failed to remove connection:", error);
      throw error;
    }
  }, [connectionStatus, isLoading, userId, user?.id, removeConnectionByUserId]);

  return {
    connectionStatus,
    connectionId: connectionData.connectionId,
    connectionData,
    isLoading,
    sendConnectionRequest,
    acceptConnectionRequest,
    declineConnectionRequest,
    withdrawConnectionRequest,
    disconnectUser,
    removeConnectionSmart,
    refreshConnectionStatus: loadConnectionStatus,
  };
}

export default useConnectionManager;
