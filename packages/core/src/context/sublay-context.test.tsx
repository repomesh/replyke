import { describe, it, expect, vi } from "vitest";
import { render, renderHook } from "@testing-library/react";

import { SublayProvider, SublayContext } from "./sublay-context";
import useProject from "../hooks/projects/useProject";

describe("SublayProvider", () => {
  it("throws when projectId is falsy", () => {
    // React + jsdom log the error to console even though it's caught below —
    // silence that expected noise for this one test.
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <SublayProvider projectId={"" as never}>
          <div />
        </SublayProvider>,
      ),
    ).toThrow("Please pass a project ID");

    consoleSpy.mockRestore();
  });
});

describe("SublayContext", () => {
  it("exposes projectId/project to consumers via useProject", () => {
    const project = { id: "project-1", integrations: [] };
    const { result } = renderHook(() => useProject(), {
      wrapper: ({ children }) => (
        <SublayContext.Provider value={{ projectId: "project-1", project }}>
          {children}
        </SublayContext.Provider>
      ),
    });

    expect(result.current.projectId).toBe("project-1");
    expect(result.current.project).toEqual(project);
  });
});
