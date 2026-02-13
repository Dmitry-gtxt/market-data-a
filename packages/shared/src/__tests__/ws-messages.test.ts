import { describe, it, expect } from "vitest";
import {
  parseWsClientMessage,
  parseWsServerMessage,
  safeParseWsClientMessage,
  EXAMPLE_SUBSCRIBE,
  EXAMPLE_ACK,
} from "../contracts/index.js";

describe("WsClientMessageSchema", () => {
  it("accepts a valid SUBSCRIBE", () => {
    const result = parseWsClientMessage(EXAMPLE_SUBSCRIBE);
    expect(result.type).toBe("SUBSCRIBE");
  });

  it("rejects unknown type", () => {
    const bad = { ...EXAMPLE_SUBSCRIBE, type: "NOPE" };
    const r = safeParseWsClientMessage(bad);
    expect(r.success).toBe(false);
  });

  it("rejects missing request_id", () => {
    const { request_id: _, ...bad } = EXAMPLE_SUBSCRIBE as Record<string, unknown>;
    const r = safeParseWsClientMessage(bad);
    expect(r.success).toBe(false);
  });
});

describe("WsServerMessageSchema", () => {
  it("accepts a valid ACK", () => {
    const result = parseWsServerMessage(EXAMPLE_ACK);
    expect(result.type).toBe("ACK");
  });
});
