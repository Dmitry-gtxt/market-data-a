import { z } from "zod";
import { SCHEMA_VERSION } from "./version.js";
import { ChannelSchema } from "./channels.js";
import { MarketTypeSchema, EnvelopeSchema } from "./envelope.js";
import { ErrorBodySchema } from "./errors.js";

// --------------- Client → ws-hub ---------------

const StreamFilterSchema = z.object({
  exchange: z.union([z.string().min(1), z.literal("any")]),
  market_type: z.union([MarketTypeSchema, z.literal("any")]),
  symbol_norm: z.union([z.string().min(1), z.literal("any")]),
  channel: z.union([ChannelSchema, z.literal("any")]),
  topN: z.number().int().positive().optional(),
  interval: z.string().optional(),
});

export type StreamFilter = z.infer<typeof StreamFilterSchema>;

const SubscribeBodySchema = z.object({
  streams: z.array(StreamFilterSchema).min(1),
  mode: z.enum(["raw", "agg"]).default("raw"),
});

const PauseResumeBodySchema = z.object({
  reason: z.string().optional(),
});

export const WsClientMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("SUBSCRIBE"),
    request_id: z.string().min(1),
    schema_version: z.literal(SCHEMA_VERSION),
    body: SubscribeBodySchema,
  }),
  z.object({
    type: z.literal("UNSUBSCRIBE"),
    request_id: z.string().min(1),
    schema_version: z.literal(SCHEMA_VERSION),
    body: SubscribeBodySchema,
  }),
  z.object({
    type: z.literal("PAUSE"),
    request_id: z.string().min(1),
    schema_version: z.literal(SCHEMA_VERSION),
    body: PauseResumeBodySchema,
  }),
  z.object({
    type: z.literal("RESUME"),
    request_id: z.string().min(1),
    schema_version: z.literal(SCHEMA_VERSION),
    body: PauseResumeBodySchema,
  }),
  z.object({
    type: z.literal("PING"),
    request_id: z.string().min(1),
    schema_version: z.literal(SCHEMA_VERSION),
    body: z.object({}).optional(),
  }),
]);

export type WsClientMessage = z.infer<typeof WsClientMessageSchema>;

// --------------- ws-hub → Client ---------------

export const WsServerMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ACK"),
    request_id: z.string(),
    ts: z.number().int(),
    schema_version: z.literal(SCHEMA_VERSION),
    body: z.object({ ok: z.literal(true) }),
  }),
  z.object({
    type: z.literal("ERROR"),
    request_id: z.string(),
    ts: z.number().int(),
    schema_version: z.literal(SCHEMA_VERSION),
    body: ErrorBodySchema,
  }),
  z.object({
    type: z.literal("EVENT"),
    schema_version: z.literal(SCHEMA_VERSION),
    body: EnvelopeSchema,
  }),
]);

export type WsServerMessage = z.infer<typeof WsServerMessageSchema>;

// --------------- Helpers ---------------

export function encodeWsMessage(msg: WsClientMessage | WsServerMessage): string {
  return JSON.stringify(msg);
}

export function parseWsClientMessage(input: unknown): WsClientMessage {
  return WsClientMessageSchema.parse(input);
}

export function parseWsServerMessage(input: unknown): WsServerMessage {
  return WsServerMessageSchema.parse(input);
}

export function safeParseWsClientMessage(input: unknown) {
  return WsClientMessageSchema.safeParse(input);
}

export function safeParseWsServerMessage(input: unknown) {
  return WsServerMessageSchema.safeParse(input);
}
