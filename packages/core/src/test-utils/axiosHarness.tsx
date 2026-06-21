import React from "react";
import { vi } from "vitest";
import {
  renderHook,
  type RenderHookOptions,
  type RenderHookResult,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import type { AxiosInstance, AxiosError, AxiosResponse } from "axios";

import axiosPublic, { axiosPrivate } from "../config/axios";
import { sublayReducers } from "../store/sublayReducers";
import { setTokens, setUser, setInitialized } from "../store/slices/authSlice";
import {
  SublayContext,
  type SublayContextValues,
} from "../context/sublay-context";
import type { AuthUser } from "../interfaces/models/User";

export type AxiosMethod = "get" | "post" | "put" | "patch" | "delete";

const AXIOS_METHODS: AxiosMethod[] = ["get", "post", "put", "patch", "delete"];

export interface AxiosCallRecord {
  url: string;
  body?: unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  config?: Record<string, any>;
}

export interface AxiosMockHandle {
  instance: AxiosInstance;
  mockResponse: <T = unknown>(method: AxiosMethod, data: T, status?: number) => void;
  mockError: (method: AxiosMethod, status: number, data?: unknown) => void;
  mockNetworkError: (method: AxiosMethod, message?: string) => void;
  calls: (method: AxiosMethod) => AxiosCallRecord[];
}

function toAxiosResponse<T>(data: T, status: number): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "Error",
    headers: {},
    config: {} as never,
  };
}

function toAxiosError(status: number, data?: unknown): AxiosError {
  const error = new Error(`Request failed with status code ${status}`) as AxiosError;
  error.isAxiosError = true;
  error.response = toAxiosResponse(data, status);
  error.config = {} as never;
  error.toJSON = () => ({});
  return error;
}

function toNetworkError(message: string): AxiosError {
  const error = new Error(message) as AxiosError;
  error.isAxiosError = true;
  error.response = undefined;
  error.config = {} as never;
  error.toJSON = () => ({});
  return error;
}

/**
 * Spies on every HTTP verb of a real axios instance so hook code that calls
 * `axios.get/post/...` hits a controllable mock instead of the network. This
 * bypasses the instance's interceptors entirely (auth-header injection,
 * 403-refresh) — that layer gets its own dedicated coverage in Task 1.3.
 */
export function mockAxiosInstance(instance: AxiosInstance): AxiosMockHandle {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spies: Record<AxiosMethod, any> = {} as never;
  for (const method of AXIOS_METHODS) {
    spies[method] = vi.spyOn(instance, method);
  }

  return {
    instance,
    mockResponse(method, data, status = 200) {
      spies[method].mockResolvedValueOnce(toAxiosResponse(data, status));
    },
    mockError(method, status, data) {
      spies[method].mockRejectedValueOnce(toAxiosError(status, data));
    },
    mockNetworkError(method, message = "Network Error") {
      spies[method].mockRejectedValueOnce(toNetworkError(message));
    },
    calls(method) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return spies[method].mock.calls.map((call: any[]) => {
        const [url, a, b] = call;
        if (method === "get" || method === "delete") {
          return { url, config: a };
        }
        return { url, body: a, config: b };
      });
    },
  };
}

export const mockAxiosPrivate = (): AxiosMockHandle => mockAxiosInstance(axiosPrivate);
export const mockAxiosPublic = (): AxiosMockHandle => mockAxiosInstance(axiosPublic);

/**
 * Restores every axios spy created via `mockAxiosPrivate`/`mockAxiosPublic`
 * (and any other `vi.spyOn`/`vi.fn` mock). Call from `afterEach` — the axios
 * instances in `config/axios.ts` are module-level singletons shared by every
 * hook in the package, so spies leak across test cases/files if not restored.
 */
export function resetAxiosMocks(): void {
  vi.restoreAllMocks();
}

export interface RenderHookWithAxiosOptions<Props>
  extends Omit<RenderHookOptions<Props>, "wrapper"> {
  projectId?: string;
  project?: SublayContextValues["project"];
  user?: AuthUser | null;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface RenderHookWithAxiosResult<Result, Props>
  extends RenderHookResult<Result, Props> {
  store: ReturnType<typeof configureStore>;
  axiosPrivate: AxiosMockHandle;
  axiosPublic: AxiosMockHandle;
}

/**
 * Renders a core hook wrapped in `SublayContext` plus a real (sublay-slice-only)
 * Redux store, with both axios instances pre-mocked. Covers the common
 * direct-axios hook shape: `useProject()` + `useUser()`/`useAuth()` +
 * `useAxiosPrivate()`/the public `axios` instance.
 */
export function renderHookWithAxios<Result, Props>(
  callback: (props: Props) => Result,
  options: RenderHookWithAxiosOptions<Props> = {},
): RenderHookWithAxiosResult<Result, Props> {
  const {
    projectId = "test-project",
    project = null,
    user = null,
    accessToken = null,
    refreshToken = null,
    ...renderOptions
  } = options;

  const store = configureStore({ reducer: { sublay: sublayReducers } });
  store.dispatch(setTokens({ accessToken, refreshToken }));
  store.dispatch(setUser(user));
  store.dispatch(setInitialized(true));

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <SublayContext.Provider
          value={{ projectId, project } as SublayContextValues}
        >
          {children}
        </SublayContext.Provider>
      </Provider>
    );
  }

  const axiosPrivateHandle = mockAxiosPrivate();
  const axiosPublicHandle = mockAxiosPublic();

  const rendered = renderHook(callback, { wrapper: Wrapper, ...renderOptions });

  return {
    ...rendered,
    store,
    axiosPrivate: axiosPrivateHandle,
    axiosPublic: axiosPublicHandle,
  };
}

export function makeAuthUser(overrides: Partial<AuthUser> = {}): AuthUser {
  return {
    id: "test-user-id",
    projectId: "test-project",
    foreignId: null,
    role: "visitor",
    email: "test@example.com",
    name: "Test User",
    username: "testuser",
    avatar: null,
    avatarFileId: null,
    bannerFileId: null,
    bio: null,
    birthdate: null,
    location: null,
    metadata: {},
    reputation: 0,
    isVerified: false,
    isActive: true,
    lastActive: "2024-01-01T00:00:00.000Z",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    suspensions: [],
    authMethods: ["password"],
    ...overrides,
  };
}
