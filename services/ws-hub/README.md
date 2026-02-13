# ws-hub

WebSocket fanout hub for Market Data Platform (Repo A).

---

## ⚠️ SINGLE REPLICA — MANDATORY

**This service MUST run as exactly 1 replica.**

Railway does not support sticky sessions. Multiple replicas would cause
clients to connect to different instances and receive incomplete data streams.

Horizontal scaling is only possible with an external pub/sub bus (Redis, NATS),
which is out of scope for the current phase.

See: [docs/DEPLOYMENT_TOPOLOGY.md](../../docs/DEPLOYMENT_TOPOLOGY.md)

---

## Role

- Accepts normalized events from `md-collector` via internal WebSocket.
- Fans out events to connected UI/API clients.
- Supports `raw` and `agg` delivery modes (with backpressure).
- Sends a `hello` event envelope on client connection.

---

## Endpoints

| Protocol | Path | Description |
|----------|------|-------------|
| HTTP GET | `/health` | Service health + version |
| HTTP GET | `/ready` | Readiness probe |
| WS | `/ws` | Client WebSocket endpoint |

---

## Hello Event Envelope

On connection, clients receive:

```json
{
  "exchange": "system",
  "market_type": "system",
  "symbol_raw": "",
  "symbol_norm": "",
  "channel": "system",
  "ts_exchange": 0,
  "ts_recv": 1707840000000,
  "seq": null,
  "event_id": "uuid-v4",
  "schema_version": 1,
  "payload": {
    "type": "hello",
    "version": "0.0.1",
    "message": "Connected to ws-hub"
  }
}
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `WS_HUB_PORT` | `3002` | HTTP + WS port |
| `APP_VERSION` | `0.0.1` | Version string |

---

## Run

```bash
pnpm --filter ws-hub dev
```
