/**
 * Symbol normalizer — converts exchange-specific raw symbols
 * to the canonical BASE-QUOTE format (e.g. "BTC-USDT").
 */

/** Known quote currencies ordered by length (longest first for greedy match). */
const QUOTE_SUFFIXES = [
  "USDT", "USDC", "BUSD", "TUSD", "FDUSD", "PYUSD",
  "USDP", "DAI", "UST",
  "BTC", "ETH", "BNB", "SOL", "XRP", "DOGE",
  "EUR", "GBP", "TRY", "BRL", "USD",
] as const;

/** Aliases: exchange-specific base names → canonical. */
const BASE_ALIASES: Record<string, string> = {
  XBT: "BTC",
};

/** Suffixes to strip before parsing (case-insensitive, applied after uppercase). */
const STRIP_SUFFIXES = ["-SWAP", "-PERP", "-FUTURES", "-SPOT", "_PERP", "_SWAP"];

/**
 * Normalize a raw exchange symbol to { symbol_norm, base, quote }.
 *
 * Rules:
 * 1. Uppercase + trim.
 * 2. Strip known contract suffixes (-SWAP, -PERP, etc.).
 * 3. Strip trailing single 'M' (e.g. XBTUSDTM → XBTUSDT).
 * 4. Replace '_' with '-'.
 * 5. If contains '-' or '/', split on it.
 * 6. Otherwise, try greedy suffix match from QUOTE_SUFFIXES.
 * 7. Apply BASE_ALIASES (XBT → BTC).
 * 8. Return BASE-QUOTE.
 */
export function normalizeSymbol(raw: string): {
  symbol_norm: string;
  base: string;
  quote: string;
} {
  let s = raw.trim().toUpperCase();

  // Strip known contract suffixes
  for (const suffix of STRIP_SUFFIXES) {
    if (s.endsWith(suffix)) {
      s = s.slice(0, -suffix.length);
      break;
    }
  }

  // Strip trailing single M (KuCoin futures: XBTUSDTM)
  if (s.length > 1 && s.endsWith("M") && !s.endsWith("UM")) {
    // Only strip if the char before M is a digit or part of a known quote
    const withoutM = s.slice(0, -1);
    for (const q of QUOTE_SUFFIXES) {
      if (withoutM.endsWith(q)) {
        s = withoutM;
        break;
      }
    }
  }

  let base: string;
  let quote: string;

  // Try splitting on separator
  const sepIdx = s.indexOf("-");
  const slashIdx = s.indexOf("/");
  const underIdx = s.indexOf("_");

  if (sepIdx > 0) {
    [base, quote] = s.split("-", 2);
  } else if (slashIdx > 0) {
    [base, quote] = s.split("/", 2);
  } else if (underIdx > 0) {
    [base, quote] = s.split("_", 2);
  } else {
    // No separator — greedy suffix match
    let matched = false;
    base = s;
    quote = "";
    for (const q of QUOTE_SUFFIXES) {
      if (s.length > q.length && s.endsWith(q)) {
        base = s.slice(0, -q.length);
        quote = q;
        matched = true;
        break;
      }
    }
    if (!matched) {
      // Fallback: treat whole string as base, empty quote
      quote = "UNKNOWN";
    }
  }

  // Apply aliases
  base = BASE_ALIASES[base] ?? base;
  quote = BASE_ALIASES[quote] ?? quote;

  return {
    symbol_norm: `${base}-${quote}`,
    base,
    quote,
  };
}
