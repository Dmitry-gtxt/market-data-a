# @market-data/db

Database package for Market Data Platform (Repo A).

---

## Migration Strategy

- **Idempotent SQL** migrations in `migrations/` directory.
- Naming: `NNNN_description.sql` (e.g., `0001_create_symbols.sql`).
- Each migration is idempotent (`CREATE TABLE IF NOT EXISTS`, `DO $$ ... $$`).
- Applied in order by a simple runner or manually via `psql`.

---

## Planned Tables

| Table | Purpose |
|-------|---------|
| `symbols` | Instrument catalog: exchange, market_type, symbol_raw, symbol_norm, status |
| `desired_subscriptions` | Active channel/symbol subscriptions for md-collector |
| `latest_snapshots` | Last value per (exchange, symbol_norm, channel) |
| `tick_files_index` | Chunk file index: bucket key, exchange, symbol, channel, time range, row_count, size |
| `health_events` | Critical events: connect/disconnect, stall, DQ violations (audit >30 days) |
| `release_log` | Deployment audit: service, version, deployed_at |

---

## Important

- **No raw tick data in PostgreSQL.** Tick-log is stored in S3-compatible bucket.
- Postgres is for indexes, snapshots, configuration, and audit only.
- See [docs/ARCHITECTURE.md](../../docs/ARCHITECTURE.md).
