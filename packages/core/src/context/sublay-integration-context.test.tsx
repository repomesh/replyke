import { describe, it, expect, afterEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook, waitFor } from "@testing-library/react";

import { mockAxiosPublic, resetAxiosMocks } from "../test-utils";
import { sublayReducers, sublayApiReducer, sublayMiddleware } from "../store/integration";
import { useSublaySelector } from "../store/hooks";
import { selectInitialized } from "../store/slices/authSlice";
import { SublayIntegrationProvider } from "./sublay-integration-context";
import useProject from "../hooks/projects/useProject";

afterEach(() => {
  resetAxiosMocks();
});

describe("SublayIntegrationProvider (host-owned external store)", () => {
  it("mounts sublayReducers/sublayApiReducer/sublayMiddleware into a host-built store and bootstraps project + auth state", async () => {
    const axiosPublic = mockAxiosPublic();
    axiosPublic.mockResponse("get", { id: "test-project", integrations: [] });

    // A store built the way a host app would, per the provider's own JSDoc:
    // sublay reducers/middleware mounted alongside the host's own reducer.
    const externalStore = configureStore({
      reducer: {
        sublay: sublayReducers,
        sublayApi: sublayApiReducer,
        host: (state = { ownedByHost: true }) => state,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(...sublayMiddleware),
    });

    const { result } = renderHook(
      () => ({
        project: useProject(),
        initialized: useSublaySelector(selectInitialized),
      }),
      {
        wrapper: ({ children }) => (
          <Provider store={externalStore}>
            <SublayIntegrationProvider projectId="test-project">
              {children}
            </SublayIntegrationProvider>
          </Provider>
        ),
      },
    );

    await waitFor(() =>
      expect(result.current.project.project).toEqual({ id: "test-project", integrations: [] }),
    );
    expect(result.current.project.projectId).toBe("test-project");

    await waitFor(() => expect(result.current.initialized).toBe(true));

    // The host's own slice survived being mounted alongside sublay's.
    expect((externalStore.getState() as { host: unknown }).host).toEqual({
      ownedByHost: true,
    });

    const [call] = axiosPublic.calls("get");
    expect(call.url).toBe("/test-project/projects/lean");
  });

  it("throws when no projectId is provided", () => {
    const externalStore = configureStore({
      reducer: { sublay: sublayReducers, sublayApi: sublayApiReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(...sublayMiddleware),
    });

    // React + jsdom log the error to console even though it's caught below —
    // silence that expected noise for this one test.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      renderHook(() => null, {
        wrapper: ({ children }) => (
          <Provider store={externalStore}>
            <SublayIntegrationProvider projectId={"" as never}>
              {children}
            </SublayIntegrationProvider>
          </Provider>
        ),
      }),
    ).toThrow("Please pass a project ID");

    consoleSpy.mockRestore();
  });
});
