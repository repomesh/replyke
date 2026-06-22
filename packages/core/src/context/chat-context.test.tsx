import { describe, it, expect, afterEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

import { resetAxiosMocks, makeChatMessage } from "../test-utils";
import { makeProvidersWrapper, createFakeSocket, type FakeSocket } from "./testHelpers";
import { selectMessages, selectTypingUsers } from "../store/slices/chatSlice";

const fakeSocket: FakeSocket = createFakeSocket();

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => fakeSocket),
}));

import { io } from "socket.io-client";
import { ChatProvider, useChatContext } from "./chat-context";

afterEach(() => {
  resetAxiosMocks();
  vi.mocked(io).mockClear();
  fakeSocket.on.mockClear();
  fakeSocket.off.mockClear();
  fakeSocket.emit.mockClear();
  fakeSocket.connect.mockClear();
  fakeSocket.disconnect.mockClear();
  fakeSocket.removeAllListeners.mockClear();
  fakeSocket.connected = false;
});

function renderChatProvider(accessToken: string | null = "token-1") {
  const { Wrapper, store, axiosPrivate } = makeProvidersWrapper({
    accessToken,
    beforeRender: ({ axiosPrivate }) =>
      axiosPrivate.mockResponse("get", { totalUnread: 0, unreadConversationCount: 0 }),
  });

  const rendered = renderHook(() => useChatContext(), {
    wrapper: ({ children }) => (
      <Wrapper>
        <ChatProvider>{children}</ChatProvider>
      </Wrapper>
    ),
  });

  return { ...rendered, store, axiosPrivate };
}

describe("ChatProvider", () => {
  it("opens a socket using the access token and project id, and exposes connected once it connects", async () => {
    const { result, axiosPrivate } = renderChatProvider("token-1");

    await waitFor(() => expect(axiosPrivate.calls("get")).toHaveLength(1));

    const [, options] = vi.mocked(io).mock.calls[0];
    expect(vi.mocked(io).mock.calls[0][0]).toBe("https://api.sublay.io");
    expect(options).toMatchObject({ auth: { token: "token-1" }, query: { projectId: "test-project" } });

    expect(result.current.socket).toBe(fakeSocket);
    expect(result.current.connected).toBe(false);

    act(() => {
      fakeSocket.trigger("connect");
    });

    expect(result.current.connected).toBe(true);
  });

  it("does not open a socket when there is no access token", () => {
    renderChatProvider(null);
    expect(io).not.toHaveBeenCalled();
  });

  it("dispatches an incoming message and increments unread for an inactive conversation", async () => {
    const { store, axiosPrivate } = renderChatProvider("token-1");
    await waitFor(() => expect(axiosPrivate.calls("get")).toHaveLength(1));
    await waitFor(() => expect(store.getState().sublay.chat.totalUnreadCount).toBe(0));

    const message = makeChatMessage({ id: "message-1", conversationId: "conversation-1" });

    act(() => {
      fakeSocket.trigger("message:created", message);
    });

    expect(selectMessages("conversation-1")(store.getState())).toEqual([message]);
    expect(store.getState().sublay.chat.totalUnreadCount).toBe(1);
  });

  it("does not bump unread for a conversation registered as active", async () => {
    const { result, store, axiosPrivate } = renderChatProvider("token-1");
    await waitFor(() => expect(axiosPrivate.calls("get")).toHaveLength(1));
    await waitFor(() => expect(store.getState().sublay.chat.totalUnreadCount).toBe(0));

    act(() => {
      result.current.registerActiveConversation("conversation-1");
    });

    const message = makeChatMessage({ id: "message-1", conversationId: "conversation-1" });
    act(() => {
      fakeSocket.trigger("message:created", message);
    });

    expect(store.getState().sublay.chat.totalUnreadCount).toBe(0);
  });

  it("tracks typing:start/typing:stop into the chat slice", async () => {
    const { store, axiosPrivate } = renderChatProvider("token-1");
    await waitFor(() => expect(axiosPrivate.calls("get")).toHaveLength(1));

    act(() => {
      fakeSocket.trigger("typing:start", { userId: "user-2", conversationId: "conversation-1" });
    });
    expect(selectTypingUsers("conversation-1")(store.getState())).toEqual(["user-2"]);

    act(() => {
      fakeSocket.trigger("typing:stop", { userId: "user-2", conversationId: "conversation-1" });
    });
    expect(selectTypingUsers("conversation-1")(store.getState())).toEqual([]);
  });

  it("disconnects and removes listeners on unmount", async () => {
    const { unmount, axiosPrivate } = renderChatProvider("token-1");
    await waitFor(() => expect(axiosPrivate.calls("get")).toHaveLength(1));

    unmount();

    expect(fakeSocket.removeAllListeners).toHaveBeenCalled();
    expect(fakeSocket.disconnect).toHaveBeenCalled();
  });
});
