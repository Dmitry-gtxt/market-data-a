# Deployment Topology — Repo A

---

## Railway Services

| Service | Type | Replicas | Notes |
|---------|------|----------|-------|
| **md-collector** | Worker (no public port или internal port для health) | 1 | Подключается к биржам, пишет в ws-hub и bucket |
| **ws-hub** | Public service (TCP/WS) | **1 (strict)** | Sticky sessions отсутствуют — single replica обязательна |
| **api-service** | Public service (HTTP) | 1+ | Stateless, можно масштабировать |
| **PostgreSQL** | Railway managed DB | 1 | Snapshots, каталог, индексы, health events |
| **Storage Bucket** | Railway Storage (S3-compatible) | — | Tick-log chunks |

---

## Vercel

| Service | Notes |
|---------|-------|
| **ui** | React SPA, деплой через Vercel. Подключается к ws-hub (WS) и api-service (REST) по public URL. |

---

## Ограничения Railway, влияющие на решения

| Ограничение | Влияние | Ссылка |
|-------------|---------|--------|
| Нет sticky sessions | ws-hub обязан быть single replica | [Scaling docs](https://docs.railway.com/deployments/scaling) |
| Логи из stdout/stderr, retention ~30 дней | Structured JSON logging; critical events дублируем в Postgres | [Logs docs](https://docs.railway.com/observability/logs) |
| Buckets = S3-compatible object storage | Tick-log chunks, доступ через AWS SDK, presigned URLs до 90 дней | [Storage Buckets docs](https://docs.railway.com/storage-buckets) |
| Volumes несовместимы с replicas | Не используем volumes в сервисах, которым нужно масштабирование | [Volumes docs](https://docs.railway.com/volumes/reference) |

---

## Версионирование деплоя

- Каждый сервис получает env `APP_VERSION` при деплое
  (например `1.0.3` или git SHA).

- При старте сервис логирует structured event:

  ```json
  {
    "level": "info",
    "event": "service_start",
    "service": "md-collector",
    "version": "1.0.3",
    "ts": "..."
  }
  ```

- Release audit: при каждом деплое api-service записывает в Postgres
  таблицу `release_log`:
  - `service`, `version`, `deployed_at`, `deployer`
    (из env или Railway API, если доступно).

- Это позволяет коррелировать проблемы с конкретными релизами
  даже после ротации логов Railway.

---

## Сетевая схема

```
┌─────────────────────────────────────────────────────┐
│                    Railway                          │
│                                                     │
│  ┌──────────────┐    internal WS    ┌────────────┐  │
│  │ md-collector  │ ───────────────▶ │  ws-hub    │  │
│  │ (1 replica)   │                  │ (1 replica)│  │
│  └──────┬───────┘                  └─────┬──────┘  │
│         │                                │          │
│         │ S3 put                         │ public   │
│         ▼                                │ WS       │
│  ┌──────────────┐                        │          │
│  │   Bucket     │                        │          │
│  │ (tick-log)   │                        │          │
│  └──────────────┘                        │          │
│         │                                │          │
│         │ index                          │          │
│         ▼                                │          │
│  ┌──────────────┐    REST          ┌─────┴──────┐  │
│  │  PostgreSQL   │◀───────────────│ api-service │  │
│  │              │                  │ (1+ rep.)  │  │
│  └──────────────┘                  └─────┬──────┘  │
│                                          │ REST     │
└──────────────────────────────────────────┼──────────┘
                                           │
                              ┌────────────┴───────────┐
                              │        Vercel           │
                              │  ┌──────────────────┐   │
                              │  │       UI          │   │
                              │  │ (React SPA)       │   │
                              │  └──────────────────┘   │
                              └────────────────────────┘
```
