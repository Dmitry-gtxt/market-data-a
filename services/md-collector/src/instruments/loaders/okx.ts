/**
 * OKX instrument loader.
 * Public REST: GET /api/v5/public/instruments
 * Docs: https://www.okx.com/docs-v5/en/#public-data-rest-api-get-instruments
 */

import { normalizeSymbol } from "@market-data/shared/utils/symbol-normalizer.js";
import type { RawInstrument } from "./bybit.js";

const BASE_URL = "https://www.okx.com";

const INST_TYPES = [
  { instType: "SPOT", market_type: "spot" },
  { instType: "SWAP", market_type: "linear" },
  // OKX SWAP can be inverse too — we check ctType in response
] as const;

interface OkxInstrument {
  instId: string;
  baseCcy: string;
  quoteCcy: string;
  state: string;
  ctType?: string; // "linear" | "inverse" for SWAP
  instType: string;
}

interface OkxResponse {
  code: string;
  data: OkxInstrument[];
}

async function fetchInstType(
  instType: string,
  defaultMarketType: string,
): Promise<RawInstrument[]> {
  const url = new URL(`${BASE_URL}/api/v5/public/instruments`);
  url.searchParams.set("instType", instType);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`OKX ${instType}: HTTP ${res.status}`);

  const json = (await res.json()) as OkxResponse;
  if (json.code !== "0") throw new Error(`OKX ${instType}: code=${json.code}`);

  const instruments: RawInstrument[] = [];

  for (const item of json.data) {
    if (item.state !== "live") continue;

    const norm = normalizeSymbol(item.instId);

    let market_type = defaultMarketType;
    if (item.instType === "SWAP" && item.ctType === "inverse") {
      market_type = "inverse";
    }

    instruments.push({
      exchange: "okx",
      market_type,
      symbol_raw: item.instId,
      symbol_norm: norm.symbol_norm,
      base: norm.base,
      quote: norm.quote,
    });
  }

  return instruments;
}

export async function loadOkxInstruments(): Promise<RawInstrument[]> {
  const results: RawInstrument[] = [];

  for (const { instType, market_type } of INST_TYPES) {
    try {
      const items = await fetchInstType(instType, market_type);
      results.push(...items);
    } catch (err) {
      console.error(JSON.stringify({
        service: "md-collector",
        event: "loader_error",
        exchange: "okx",
        instType,
        error: String(err),
      }));
    }
  }

  return results;
}
