import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AjaxService } from "../../src/core/AjaxService.js";
import { Logger } from "../../src/core/Logger.js";


describe("AjaxService", () => {
  let service;
  let logger;
  let xhrInstance;

  beforeEach(() => {
    logger = new Logger();

    vi.spyOn(logger, "info");
    vi.spyOn(logger, "error");

    service = new AjaxService(logger);

    xhrInstance = {
      open: vi.fn(),
      send: vi.fn(),
      setRequestHeader: vi.fn(),
      getResponseHeader: vi.fn(),
      onload: null,
      onerror: null,
      ontimeout: null,
      status: 200,
      responseText: "{\"success\":true}",
      timeout: 0,
    };

    global.XMLHttpRequest = vi.fn(() => xhrInstance);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should perform a GET request and log success", async () => {
    xhrInstance.getResponseHeader = vi.fn(() => "application/json");

    setTimeout(() => xhrInstance.onload());

    const result = await service.get("https://jsonplaceholder.typicode.com/comments");

    console.log(result)

    expect(result).toEqual({ success: true });
    expect(logger.info).toHaveBeenCalledWith(
      expect.stringContaining("AJAX Success"),
      expect.anything(),
    );
  });

  it("should log and throw on HTTP error", async () => {
    xhrInstance.status = 404;
    xhrInstance.statusText = "Not Found";
    setTimeout(() => xhrInstance.onload());

    await expect(service.get("/fail")).rejects.toThrow("HTTP 404: Not Found");
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("AJAX Error"), expect.anything());
  });
});
