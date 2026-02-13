# api-service

REST API for Market Data Platform (Repo A).

---

## Role

- Manage desired subscriptions (CRUD).
- Serve latest snapshots from PostgreSQL.
- Generate presigned URLs for tick-log replay from S3 bucket.
- Health and readiness endpoints.

---

## Endpoints

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/health` | ✅ | Service health + version |
| GET | `/ready` | ✅ | Readiness probe |
| GET | `/subscriptions` | Stub | List active subscriptions |
| GET | `/snapshots` | Stub | Latest snapshots |
| POST | `/replay` | 501 | Tick-log replay (not implemented) |

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_SERVICE_PORT` | `3001` | HTTP port |
| `APP_VERSION` | `0.0.1` | Version string for health endpoint |
| `DATABASE_URL` | — | PostgreSQL connection string |
| `BUCKET_ENDPOINT` | — | S3-compatible bucket endpoint |
| `BUCKET_ACCESS_KEY` | — | Bucket access key |
| `BUCKET_SECRET_KEY` | — | Bucket secret key |

---

## Run

```bash
pnpm --filter api-service dev
```
