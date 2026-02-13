/**
 * Instrument sync orchestrator.
 *
 * Calls exchange loaders and upserts results into DB.
 * NOTE: In P04 we use in-memory store since DB client is not yet wired.
 *       Real Postgres upsert will be added in P05 when @market-data/db has a client.
 */

import type { RawInstrument } from "./loaders/index.js";
import { loadBybitInstruments, loadOkxInstruments } from "./loaders/index.js";

/** In-memory catalog — will be replaced by Postgres in P05. */
export const instrumentStore = {
  symbols: new Map<string, { symbol_norm: string; base: string; quote: string }>(),
  aliases: [] as RawInstrument[],
  markets: new Map<string, { exchange: string; market_type: string; active: boolean }>(),
};

type LoaderFn = () => Promise<RawInstrument[]>;

const LOADERS: Record<string, LoaderFn> = {
  bybit: loadBybitInstruments,
  okx: loadOkxInstruments,
  // TODO: kucoin, bitget, gate, htx, bingx
};

let syncLock = false;

export interface SyncResult {
  ok: boolean;
  synced_exchanges: string[];
  counts: Record<string, number>;
  errors: string[];
}

export async function syncInstruments(
  opts: { exchanges?: string[] } = {},
): Promise<SyncResult> {
  if (syncLock) {
    return { ok: false, synced_exchanges: [], counts: {}, errors: ["sync already in progress"] };
  }

  syncLock = true;
  const exchanges = opts.exchanges ?? Object.keys(LOADERS);
  const result: SyncResult = { ok: true, synced_exchanges: [], counts: {}, errors: [] };

  try {
    for (const ex of exchanges) {
      const loader = LOADERS[ex];
      if (!loader) {
        result.errors.push(`no loader for exchange: ${ex}`);
        continue;
      }

      try {
        const instruments = await loader();

        for (const inst of instruments) {
          // Upsert symbol
          if (!instrumentStore.symbols.has(inst.symbol_norm)) {
            instrumentStore.symbols.set(inst.symbol_norm, {
              symbol_norm: inst.symbol_norm,
              base: inst.base,
              quote: inst.quote,
            });
          }

          // Track market
          const marketKey = `${inst.exchange}:${inst.market_type}`;
          if (!instrumentStore.markets.has(marketKey)) {
            instrumentStore.markets.set(marketKey, {
              exchange: inst.exchange,
              market_type: inst.market_type,
              active: true,
            });
          }
        }

        // Append aliases
        instrumentStore.aliases.push(...instruments);

        result.synced_exchanges.push(ex);
        result.counts[ex] = instruments.length;

        console.log(JSON.stringify({
          service: "md-collector",
          event: "instruments_synced",
          exchange: ex,
          count: instruments.length,
        }));
      } catch (err) {
        result.errors.push(`${ex}: ${String(err)}`);
        result.ok = false;
      }
    }
  } finally {
    syncLock = false;
  }

  return result;
}
