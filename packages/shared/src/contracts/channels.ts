import { z } from "zod";

/**
 * Supported data channels.
 *
 * Phase-1 (MVP): trades, ticker_bbo, klines, orderbook_topN, system.
 * Phase-2: mark_index_funding, open_interest.
 */
export const ChannelSchema = z.enum([
  "trades",
  "ticker_bbo",
  "klines",
  "orderbook_topN",
  "mark_index_funding",
  "open_interest",
  "system",
]);

export type Channel = z.infer<typeof ChannelSchema>;

export const CHANNELS = ChannelSchema.options;
