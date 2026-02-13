import type { Envelope } from "./envelope.js";

/**
 * Dedupe / gap-detection key helpers.
 *
 * If `seq` is present → dedupe by seq (exchange-level sequence).
 * If `seq` is absent  → dedupe by ts_exchange + simple payload fingerprint.
 *
 * Limitations:
 * - Fingerprint is NOT a cryptographic hash — collisions possible for very
 *   large payloads truncated to FINGERPRINT_LIMIT.
 * - Clock-skew between exchanges can cause false-positive gap detection.
 */

const FINGERPRINT_LIMIT = 256;

/** Stable one-line JSON (sorted keys, truncated). */
function fingerprint(payload: unknown): string {
  try {
    const s = JSON.stringify(payload, Object.keys(payload as Record<string, unknown>).sort());
    return s.length > FINGERPRINT_LIMIT ? s.slice(0, FINGERPRINT_LIMIT) : s;
  } catch {
    return "?";
  }
}

/**
 * Key for deduplication.
 * Format: `{exchange}|{market_type}|{symbol_norm}|{channel}|{seq || ts+fp}`
 */
export function makeDedupeKey(env: Envelope): string {
  const base = `${env.exchange}|${env.market_type}|${env.symbol_norm}|${env.channel}`;
  if (env.seq != null) return `${base}|seq:${env.seq}`;
  return `${base}|ts:${env.ts_exchange}:${fingerprint(env.payload)}`;
}

/**
 * Key for gap detection (per stream, ignores individual event identity).
 * Format: `{exchange}|{market_type}|{symbol_norm}|{channel}`
 */
export function makeGapKey(env: Envelope): string {
  return `${env.exchange}|${env.market_type}|${env.symbol_norm}|${env.channel}`;
}
