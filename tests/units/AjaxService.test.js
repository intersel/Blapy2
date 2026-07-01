import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AjaxService } from "../../src/core/AjaxService.js";
import { Logger } from "../../src/core/Logger.js";

// Minimal fetch Response stand-in exposing only what AjaxService reads.
function mockResponse({ status = 200, body = "", contentType = "application/json" } = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get: (name) => (name.toLowerCase() === "content-type" ? contentType : null),
    },
    json: async () => JSON.parse(body),
    text: async () => body,
  };
}

describe("AjaxService", () => {
  let service;
  let logger;
  let fetchMock;

  beforeEach(() => {
    logger = new Logger();

    vi.spyOn(logger, "info");
    vi.spyOn(logger, "error");

    service = new AjaxService(logger);

    // AjaxService builds a `new Request(url, { signal })`. In jsdom, Request
    // validates that `signal` is *its* AbortSignal, which rejects Node's
    // AbortController signal. Stub Request with a pass-through so construction
    // never throws; the mocked fetch ignores it anyway.
    vi.stubGlobal(
      "Request",
      class {
        constructor(url, options = {}) {
          this.url = url;
          Object.assign(this, options);
          this.headers = { set: () => {} };
        }
      },
    );

    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("should perform a GET request and log success", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ status: 200, body: '{"success":true}', contentType: "application/json" }),
    );

    const result = await service.get("https://jsonplaceholder.typicode.com/comments");

    expect(result).toEqual({ success: true });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("AJAX Success"),
      expect.anything(),
    );
  });

  it("should log and throw on HTTP error", async () => {
    fetchMock.mockResolvedValue(
      mockResponse({ status: 404, body: "Not Found", contentType: "text/plain" }),
    );

    await expect(service.get("/fail")).rejects.toThrow("HTTP 404");
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("AJAX Error"));
  });
});