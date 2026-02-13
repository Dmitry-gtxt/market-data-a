import { z } from "zod";
import { SCHEMA_VERSION } from "./version.js";
import { ChannelSchema } from "./channels.js";

export const MarketTypeSchema = z.enum(["spot", "linear", "inverse", "system"]);
export type MarketType = z.infer<typeof MarketTypeSchema>;

export const EnvelopeSchema = z.object({
  exchange: z.string().min(1),
  market_type: MarketTypeSchema,
  symbol_raw: z.string(),
  symbol_norm: z.string(),
  channel: ChannelSchema,
  ts_exchange: z.number().int(),
  ts_recv: z.number().int(),
  seq: z.number().int().nullish(),
  event_id: z.string().min(1),
  schema_version: z.literal(SCHEMA_VERSION),
  payload: z.unknown(),
});

export type Envelope = z.infer<typeof EnvelopeSchema>;

/** Parse envelope — throws ZodError on failure. */
export function parseEnvelope(input: unknown): Envelope {
  return EnvelopeSchema.parse(input);
}

/** Safe parse — never throws. */
export function safeParseEnvelope(input: unknown):
  | { ok: true; data: Envelope }
  | { ok: false; error: z.ZodError } {
  const result = EnvelopeSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error };
}
