import { describe, it, expect } from "vitest";
import { makeDedupeKey, makeGapKey, EXAMPLE_TRADE_ENVELOPE } from "../contracts/index.js";

describe("dedupe helpers", () => {
  it("produces deterministic key with seq", () => {
    const k1 = makeDedupeKey(EXAMPLE_TRADE_ENVELOPE);
    const k2 = makeDedupeKey(EXAMPLE_TRADE_ENVELOPE);
    expect(k1).toBe(k2);
    expect(k1).toContain("seq:42");
  });

  it("falls back to ts fingerprint without seq", () => {
    const noSeq = { ...EXAMPLE_TRADE_ENVELOPE, seq: null };
    const k = makeDedupeKey(noSeq);
    expect(k).toContain("ts:");
    expect(k).not.toContain("seq:");
  });

  it("makeGapKey ignores seq", () => {
    const k = makeGapKey(EXAMPLE_TRADE_ENVELOPE);
    expect(k).toBe("bybit|linear|BTC-USDT|trades");
  });
});
