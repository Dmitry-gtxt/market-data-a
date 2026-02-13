/**
 * Bybit instrument loader.
 * Public REST: GET /v5/market/instruments-info
 * Docs: https://bybit-exchange.github.io/docs/v5/market/instrument
 */

import { normalizeSymbol } from "@market-data/shared/utils/symbol-normalizer.js";

export interface RawInstrument {
  exchange: string;
  market_type: string;
  symbol_raw: string;
  symbol_norm: string;
  base: string;
  quote: string;
}

const BASE_URL = "https://api.bybit.com";

const CATEGORIES = [
  { category: "spot", market_type: "spot" },
  { category: "linear", market_type: "linear" },
  { category: "inverse", market_type: "inverse" },
] as const;

interface BybitInstrument {
  symbol: string;
  baseCoin: string;
  quoteCoin: string;
  status: string;
}

interface BybitResponse {
  retCode: number;
  result: {
    list: BybitInstrument[];
    nextPageCursor?: string;
  };
}

async function fetchCategory(
  category: string,
  market_type: string,
): Promise<RawInstrument[]> {
  const instruments: RawInstrument[] = [];
  let cursor: string | undefined;

  do {
    const url = new URL(`${BASE_URL}/v5/market/instruments-info`);
    url.searchParams.set("category", category);
    url.searchParams.set("limit", "1000");
    if (cursor) url.searchParams.set("cursor", cursor);

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error(`Bybit ${category}: HTTP ${res.status}`);

    const json = (await res.json()) as BybitResponse;
    if (json.retCode !== 0) throw new Error(`Bybit ${category}: retCode=${json.retCode}`);

    for (const item of json.result.list) {
      if (item.status !== "Trading") continue;

      const norm = normalizeSymbol(item.symbol);
      instruments.push({
        exchange: "bybit",
        market_type,
        symbol_raw: item.symbol,
        symbol_norm: norm.symbol_norm,
        base: norm.base,
        quote: norm.quote,
      });
    }

    cursor = json.result.nextPageCursor || undefined;
  } while (cursor);

  return instruments;
}

export async function loadBybitInstruments(): Promise<RawInstrument[]> {
  const results: RawInstrument[] = [];

  for (const { category, market_type } of CATEGORIES) {
    try {
      const items = await fetchCategory(category, market_type);
      results.push(...items);
    } catch (err) {
      console.error(JSON.stringify({
        service: "md-collector",
        event: "loader_error",
        exchange: "bybit",
        category,
        error: String(err),
      }));
    }
  }

  return results;
}
