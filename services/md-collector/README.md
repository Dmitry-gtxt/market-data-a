# md-collector

Market data collector for Repo A.

---

## Role

- Connects to exchange public WebSocket/REST APIs.
- Normalizes data into unified event envelope.
- Publishes events to ws-hub (internal WS).
- Writes tick-log chunks to S3-compatible bucket.
- Performs DQ checks (dedupe, gap detection, stall detection).

---

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health + version |
| GET | `/ready` | Readiness probe |

---

## Directory Structure

```
src/
├── server.ts        # Fastify health server
├── index.ts         # Entry point
├── exchanges/       # Per-exchange WS adapters (future)
├── pipeline/        # Normalization, DQ, routing (future)
└── storage/         # Chunk writer, S3 client (future)
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `MD_COLLECTOR_PORT` | `3003` | HTTP port (health only) |
| `APP_VERSION` | `0.0.1` | Version string |
| `WS_HUB_INTERNAL_URL` | `ws://localhost:3002` | Internal ws-hub URL |
| `DATABASE_URL` | — | PostgreSQL (for snapshots/index) |
| `BUCKET_ENDPOINT` | — | S3 bucket endpoint |
| `BUCKET_ACCESS_KEY` | — | Bucket access key |
| `BUCKET_SECRET_KEY` | — | Bucket secret key |

---

## Run

```bash
pnpm --filter md-collector dev
```
