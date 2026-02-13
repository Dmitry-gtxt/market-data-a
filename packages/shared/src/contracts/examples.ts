import type { Envelope } from "./envelope.js";
import type { WsClientMessage, WsServerMessage } from "./ws-messages.js";
import { SCHEMA_VERSION } from "./version.js";

/** Minimal valid trade envelope. */
export const EXAMPLE_TRADE_ENVELOPE: Envelope = {
  exchange: "bybit",
  market_type: "linear",
  symbol_raw: "BTCUSDT",
  symbol_norm: "BTC-USDT",
  channel: "trades",
  ts_exchange: 1700000000000,
  ts_recv: 1700000000005,
  seq: 42,
  event_id: "01HFXYZ000000000000000000",
  schema_version: SCHEMA_VERSION,
  payload: {
    price: "43210.50",
    qty: "0.01",
    side: "buy",
  },
};

/** Minimal system hello envelope (ws-hub). */
export const EXAMPLE_HELLO_ENVELOPE: Envelope = {
  exchange: "system",
  market_type: "system",
  symbol_raw: "",
  symbol_norm: "",
  channel: "system",
  ts_exchange: 0,
  ts_recv: 1700000000000,
  seq: null,
  event_id: "01HFXYZ000000000000000001",
  schema_version: SCHEMA_VERSION,
  payload: { type: "hello", version: "0.0.1", message: "Connected to ws-hub" },
};

/** Minimal SUBSCRIBE command. */
export const EXAMPLE_SUBSCRIBE: WsClientMessage = {
  type: "SUBSCRIBE",
  request_id: "req-001",
  schema_version: SCHEMA_VERSION,
  body: {
    streams: [
      {
        exchange: "bybit",
        market_type: "linear",
        symbol_norm: "BTC-USDT",
        channel: "trades",
      },
    ],
    mode: "raw",
  },
};

/** Minimal ACK response. */
export const EXAMPLE_ACK: WsServerMessage = {
  type: "ACK",
  request_id: "req-001",
  ts: 1700000000010,
  schema_version: SCHEMA_VERSION,
  body: { ok: true },
};
