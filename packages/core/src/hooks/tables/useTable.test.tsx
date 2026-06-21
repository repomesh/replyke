import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { waitFor, act } from "@testing-library/react";

import {
  renderHookWithStore,
  stubFetchMock,
  unstubFetchMock,
  jsonResponse,
  type FetchMockHandle,
} from "../../test-utils";
import { useTable } from "./useTable";

const ROWS = [
  { id: "1", name: "alpha" },
  { id: "2", name: "bravo" },
];

let fetchHandle: FetchMockHandle;

beforeEach(() => {
  fetchHandle = stubFetchMock(async (...args: unknown[]) => {
    const req = args[0] as Request | string;
    const url = typeof req === "string" ? req : req.url;
    const method =
      (typeof req === "string"
        ? (args[1] as RequestInit | undefined)?.method
        : (req as Request).method) ?? "GET";

    if (method === "GET" && url.includes("/db/Events")) {
      return jsonResponse({
        data: ROWS,
        pagination: {
          page: 1,
          pageSize: 20,
          totalPages: 1,
          totalItems: 2,
          hasMore: false,
        },
      });
    }
    if (method === "POST" && url.includes("/db/Events")) {
      return jsonResponse({ row: { id: "3", name: "charlie" } }, 201);
    }
    return jsonResponse({}, 404);
  });
});

afterEach(() => {
  unstubFetchMock();
});

describe("useTable", () => {
  it("loads rows from the /db surface", async () => {
    const { result } = renderHookWithStore(() => useTable("Events"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.rows.map((r) => r.id)).toEqual(["1", "2"]);
    expect(result.current.pagination?.totalItems).toBe(2);

    // The GET hit the logical-name /db route.
    const getCall = fetchHandle
      .calls()
      .find((c) => c.url.includes("/test-project/db/Events"));
    expect(getCall).toBeTruthy();
  });

  it("createRow issues a POST and returns the new row", async () => {
    const { result } = renderHookWithStore(() => useTable("Events"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    let created: { id: string } | undefined;
    await act(async () => {
      created = await result.current.createRow({ name: "charlie" });
    });
    expect(created?.id).toBe("3");

    const postCall = fetchHandle.calls().find((c) => c.method === "POST");
    expect(postCall).toBeTruthy();
  });

  it("exposes view controls that update the slice", async () => {
    const { result } = renderHookWithStore(() => useTable("Events"));
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.setIncludeDeleted(true));
    await waitFor(() =>
      expect(result.current.view.includeDeleted).toBe(true),
    );
    expect(result.current.view.page).toBe(1);
  });
});
