import { z } from "zod";
import { SCHEMA_VERSION } from "./version.js";
import { EnvelopeSchema, MarketTypeSchema } from "./envelope.js";
import { ChannelSchema } from "./channels.js";

// --- GET /health ---

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  version: z.string(),
  ts: z.number().int(),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

// --- GET /ready ---

export const ReadyResponseSchema = z.object({
  ready: z.boolean(),
  service: z.string(),
});

export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;

// --- GET /subscriptions ---

export const SubscriptionItemSchema = z.object({
  exchange: z.string(),
  market_type: MarketTypeSchema,
  symbol_norm: z.string(),
  channel: ChannelSchema,
  active: z.boolean(),
});

export const SubscriptionsResponseSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  subscriptions: z.array(SubscriptionItemSchema),
});

export type SubscriptionsResponse = z.infer<typeof SubscriptionsResponseSchema>;

// --- GET /snapshots ---

export const SnapshotsResponseSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  snapshots: z.array(EnvelopeSchema),
});

export type SnapshotsResponse = z.infer<typeof SnapshotsResponseSchema>;

// --- POST /replay ---

export const ReplayRequestSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  exchange: z.string().min(1),
  symbol_norm: z.string().min(1),
  channel: ChannelSchema,
  from_ts: z.number().int().optional(),
  to_ts: z.number().int().optional(),
  limit: z.number().int().positive().optional(),
});

export type ReplayRequest = z.infer<typeof ReplayRequestSchema>;

export const ReplayResponseSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  presigned_urls: z.array(z.string().url()),
  note: z.string().optional(),
});

export type ReplayResponse = z.infer<typeof ReplayResponseSchema>;

// --- GET /symbols ---

export const SymbolItemSchema = z.object({
  symbol_norm: z.string(),
  base_asset: z.string(),
  quote_asset: z.string(),
});

export const SymbolsResponseSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  symbols: z.array(SymbolItemSchema),
});

export type SymbolsResponse = z.infer<typeof SymbolsResponseSchema>;

// --- GET /markets ---

export const MarketItemSchema = z.object({
  exchange: z.string(),
  market_type: MarketTypeSchema,
  active: z.boolean(),
  supports_spot: z.boolean().optional(),
  supports_linear: z.boolean().optional(),
  supports_inverse: z.boolean().optional(),
  has_incremental_books: z.boolean().optional(),
  has_funding: z.boolean().optional(),
  has_open_interest: z.boolean().optional(),
});

export const MarketsResponseSchema = z.object({
  schema_version: z.literal(SCHEMA_VERSION),
  markets: z.array(MarketItemSchema),
});

export type MarketsResponse = z.infer<typeof MarketsResponseSchema>;
