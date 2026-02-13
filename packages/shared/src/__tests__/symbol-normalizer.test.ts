import { describe, it, expect } from "vitest";
import { normalizeSymbol } from "../utils/symbol-normalizer.js";

describe("normalizeSymbol", () => {
  const cases: Array<[string, string, string, string]> = [
    // [raw, expectedNorm, expectedBase, expectedQuote]
    // Bybit linear
    ["BTCUSDT", "BTC-USDT", "BTC", "USDT"],
    // Bybit spot
    ["ETHUSDC", "ETH-USDC", "ETH", "USDC"],
    // OKX format
    ["BTC-USDT", "BTC-USDT", "BTC", "USDT"],
    ["ETH-USDT-SWAP", "ETH-USDT", "ETH", "USDT"],
    ["BTC-USD-SWAP", "BTC-USD", "BTC", "USD"],
    // KuCoin spot
    ["BTC-USDT", "BTC-USDT", "BTC", "USDT"],
    // KuCoin futures with M suffix
    ["XBTUSDTM", "BTC-USDT", "BTC", "USDT"],
    ["XBTUSDM", "BTC-USD", "BTC", "USD"],
    // Bitget
    ["BTCUSDT_UMCBL", "BTC-USDT", "BTC", "USDT"],
    // Gate with underscore
    ["BTC_USDT", "BTC-USDT", "BTC", "USDT"],
    // lowercase input
    ["btcusdt", "BTC-USDT", "BTC", "USDT"],
    // slash separator
    ["ETH/BTC", "ETH-BTC", "ETH", "BTC"],
    // Perp suffix
    ["BTCUSDT-PERP", "BTC-USDT", "BTC", "USDT"],
    // BingX-like
    ["ETH-USDT-SPOT", "ETH-USDT", "ETH", "USDT"],
    // XBT alias
    ["XBTUSDT", "BTC-USDT", "BTC", "USDT"],
    // Trim whitespace
    [" BTCUSDT ", "BTC-USDT", "BTC", "USDT"],
    // SOL quote
    ["BONKSOL", "BONK-SOL", "BONK", "SOL"],
    // DOGE as base
    ["DOGEUSDT", "DOGE-USDT", "DOGE", "USDT"],
  ];

  it.each(cases)(
    "normalizeSymbol(%s) => %s (base=%s, quote=%s)",
    (raw, norm, base, quote) => {
      const result = normalizeSymbol(raw);
      expect(result.symbol_norm).toBe(norm);
      expect(result.base).toBe(base);
      expect(result.quote).toBe(quote);
    }
  );
});
