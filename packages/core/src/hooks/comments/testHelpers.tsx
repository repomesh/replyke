import React from "react";
import { renderHook, type RenderHookResult } from "@testing-library/react";
import { Provider } from "react-redux";

import {
  makeSublayStore,
  mockAxiosPrivate,
  mockAxiosPublic,
  type AxiosMockHandle,
} from "../../test-utils";
import { setTokens, setUser, setInitialized } from "../../store/slices/authSlice";
import { SublayContext, type SublayContextValues } from "../../context/sublay-context";
import {
  CommentSectionContext,
  type CommentSectionContextValues,
} from "../../context/comment-section-context";
import type { AuthUser } from "../../interfaces/models/User";

export { makeComment, makeEntity } from "../../test-utils";

export interface RenderWithCommentSectionOptions {
  projectId?: string;
  user?: AuthUser | null;
  commentSectionValue?: Partial<CommentSectionContextValues>;
  beforeRender?: (handles: {
    axiosPrivate: AxiosMockHandle;
    axiosPublic: AxiosMockHandle;
  }) => void;
}

export interface RenderWithCommentSectionResult<Result>
  extends RenderHookResult<Result, unknown> {
  axiosPrivate: AxiosMockHandle;
  axiosPublic: AxiosMockHandle;
}

/**
 * Like `renderHookWithAxios`, but also nests a `CommentSectionContext.Provider`
 * — needed by hooks (`useReplies`, `useCommentSection`) that read comment-tree
 * state from that context rather than taking it as a parameter.
 */
export function renderWithCommentSection<Result>(
  callback: () => Result,
  options: RenderWithCommentSectionOptions = {},
): RenderWithCommentSectionResult<Result> {
  const {
    projectId = "test-project",
    user = null,
    commentSectionValue = {},
    beforeRender,
  } = options;

  const store = makeSublayStore();
  store.dispatch(setTokens({ accessToken: null, refreshToken: null }));
  store.dispatch(setUser(user));
  store.dispatch(setInitialized(true));

  const axiosPrivateHandle = mockAxiosPrivate();
  const axiosPublicHandle = mockAxiosPublic();

  beforeRender?.({ axiosPrivate: axiosPrivateHandle, axiosPublic: axiosPublicHandle });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <Provider store={store}>
        <SublayContext.Provider
          value={{ projectId, project: null } as SublayContextValues}
        >
          <CommentSectionContext.Provider value={commentSectionValue}>
            {children}
          </CommentSectionContext.Provider>
        </SublayContext.Provider>
      </Provider>
    );
  }

  const rendered = renderHook(callback, { wrapper: Wrapper });

  return { ...rendered, axiosPrivate: axiosPrivateHandle, axiosPublic: axiosPublicHandle };
}
