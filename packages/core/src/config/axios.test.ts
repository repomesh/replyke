import { describe, it, expect } from "vitest";

import axiosPublic, { axiosPrivate, BASE_URL } from "./axios";

describe("config/axios", () => {
  it("configures the public instance with the API base URL", () => {
    expect(axiosPublic.defaults.baseURL).toBe(BASE_URL);
  });

  it("configures axiosPrivate with the same base URL and a JSON content type", () => {
    expect(axiosPrivate.defaults.baseURL).toBe(BASE_URL);
    expect(axiosPrivate.defaults.headers["Content-Type"]).toBe("application/json");
  });

  it("exposes two distinct instances", () => {
    expect(axiosPrivate).not.toBe(axiosPublic);
  });
});
