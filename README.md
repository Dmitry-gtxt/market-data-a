# Market Data Platform — Repo A

Public market data collection, normalization, and streaming platform.

Exchanges: Bybit, KuCoin, Bitget, Gate, HTX, OKX, BingX.

---

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full architecture overview.

| Service | Role | Port | Replicas |
|---------|------|------|----------|
| `services/md-collector` | Connects to exchange WS/REST, normalizes, publishes to ws-hub, writes tick-log chunks | 3003 | 1 (strict) |
| `services/ws-hub` | Single-replica fanout WS server with backpressure (raw/agg) | 3002 | **1 (strict)** |
| `services/api-service` | REST API: subscriptions, snapshots, replay | 3001 | 1+ |
| `apps/ui` | React SPA: stream table, filters, WS client | 5173 | — (Vercel) |

> **⚠️ ws-hub MUST remain single replica.**
> Railway does not support sticky sessions.
> See [docs/DEPLOYMENT_TOPOLOGY.md](docs/DEPLOYMENT_TOPOLOGY.md).

---

## Monorepo Structure

```
├── apps/ui/                  # React + Vite (deployed to Vercel)
├── services/
│   ├── md-collector/         # Exchange data collector
│   ├── ws-hub/               # WebSocket fanout hub
│   └── api-service/          # REST API
├── packages/
│   ├── shared/               # Contracts, enums, utils (Zod schemas)
│   └── db/                   # DB migrations, models
├── docs/                     # Architecture, capabilities, limits
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## Prerequisites

- Node.js 22+
- pnpm 9+

---

## Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env
cp .env.example .env
# Fill in DATABASE_URL, BUCKET_* credentials

# 3. Start all services + UI
pnpm dev

# 4. Or start individually
pnpm --filter md-collector dev
pnpm --filter ws-hub dev
pnpm --filter api-service dev
pnpm --filter ui dev
```

### Health Checks

```bash
curl http://localhost:3001/health   # api-service
curl http://localhost:3002/health   # ws-hub
curl http://localhost:3003/health   # md-collector
```

---

## Build

```bash
pnpm build
```

---

## Lint

```bash
pnpm lint
```

---

## Deploy

### Railway (backend services)

Each service in `services/` deploys as a separate Railway service.

Environment variables are injected via Railway dashboard.

**Critical**: `ws-hub` must be configured as **1 replica** — no horizontal scaling without external pub/sub.

### Vercel (UI)

`apps/ui` deploys as a static SPA on Vercel.

Set environment variables:
- `VITE_API_URL` — public URL of api-service
- `VITE_WS_URL` — public URL of ws-hub

---

## Key Constraints

1. **No exchange API keys** — Repo A uses only public endpoints.
2. **No raw ticks in PostgreSQL** — tick-log goes to S3 bucket; Postgres stores indexes/snapshots only.
3. **ws-hub = single replica** — sticky sessions not available on Railway.
4. **md-collector = single replica** — until subscription planner is implemented.

See [docs/NON_NEGOTIABLES.md](docs/NON_NEGOTIABLES.md) for full list.

---

## Documentation

- [ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [DEPLOYMENT_TOPOLOGY.md](docs/DEPLOYMENT_TOPOLOGY.md)
- [NON_NEGOTIABLES.md](docs/NON_NEGOTIABLES.md)
- [CAPABILITIES.md](docs/CAPABILITIES.md)
- [RATE_LIMITS.md](docs/RATE_LIMITS.md)
- [EXCHANGE_NOTES.md](docs/EXCHANGE_NOTES.md)
