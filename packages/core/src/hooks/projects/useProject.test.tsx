import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";

import useProject from "./useProject";

describe("useProject", () => {
  it("returns the default context value when rendered outside a SublayProvider", () => {
    // The provider-backed case (SublayContext.Provider supplying a real
    // projectId/project) is already covered by sublay-context.test.tsx —
    // this just pins the unprovided default, which that test doesn't exercise.
    const { result } = renderHook(() => useProject());
    expect(result.current).toEqual({ projectId: "", project: null });
  });
});
