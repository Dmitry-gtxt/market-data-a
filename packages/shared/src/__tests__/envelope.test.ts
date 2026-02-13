import { describe, it, expect } from "vitest";
import {
  parseEnvelope,
  safeParseEnvelope,
  EXAMPLE_TRADE_ENVELOPE,
  EXAMPLE_HELLO_ENVELOPE,
} from "../contracts/index.js";

describe("EnvelopeSchema", () => {
  it("accepts a valid trade envelope", () => {
    const result = parseEnvelope(EXAMPLE_TRADE_ENVELOPE);
    expect(result.channel).toBe("trades");
    expect(result.schema_version).toBe(1);
  });

  it("accepts a valid hello envelope", () => {
    const result = parseEnvelope(EXAMPLE_HELLO_ENVELOPE);
    expect(result.channel).toBe("system");
  });

  it("rejects missing exchange", () => {
    const bad = { ...EXAMPLE_TRADE_ENVELOPE, exchange: "" };
    const r = safeParseEnvelope(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects wrong schema_version", () => {
    const bad = { ...EXAMPLE_TRADE_ENVELOPE, schema_version: 2 };
    const r = safeParseEnvelope(bad);
    expect(r.ok).toBe(false);
  });

  it("rejects invalid channel", () => {
    const bad = { ...EXAMPLE_TRADE_ENVELOPE, channel: "foo" };
    const r = safeParseEnvelope(bad);
    expect(r.ok).toBe(false);
  });
});
