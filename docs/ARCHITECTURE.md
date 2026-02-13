# Architecture — Market Data Platform (Repo A)

## Services

| Service | Role | Runtime |
|---------|------|---------|
| **md-collector** | Подключается к public WS/REST бирж (Bybit, KuCoin, Bitget, Gate, HTX, OKX, BingX). Нормализует данные, выполняет DQ-проверки, публикует события в ws-hub, пишет tick-log chunks в S3 bucket. | Node 22 + Fastify + ws |
| **ws-hub** | Single-replica fanout WebSocket-сервер. Принимает нормализованные события от md-collector (внутренний WS), раздаёт подключённым UI/клиентам с backpressure (raw/agg режимы). | Node 22 + ws |
| **api-service** | REST API: управление подписками (desired subscriptions), выдача latest snapshots, replay tick-log через presigned URLs, health/readiness. | Node 22 + Fastify |
| **ui** | React 18 + Vite + TypeScript. Stream-таблица с фильтрами, переключение raw/agg, WebSocket-клиент к ws-hub. | Vercel |

## Data Flow

```
Биржи (public WS/REST)
  │
  ▼
md-collector  ──(internal WS)──▶  ws-hub  ──(client WS)──▶  ui / clients
  │
  ├──▶  S3 Bucket (tick-log chunks, partitioned)
  │         │
  │         ▼
  │     Postgres: tick_files_index (chunk metadata)
  │
  └──▶  Postgres: latest_snapshots (upsert per symbol/channel)
```

- **Replay**: api-service читает tick_files_index → генерирует presigned URL → клиент скачивает chunk напрямую из bucket.
- **Latest state**: api-service читает latest_snapshots из Postgres → REST → ui.

## Storage

### PostgreSQL (Railway)

| Сущность | Назначение |
|----------|------------|
| `symbols` | Каталог инструментов: exchange, market_type, symbol_raw, symbol_norm, status |
| `desired_subscriptions` | Какие каналы/символы активны для сбора |
| `latest_snapshots` | Последнее значение по (exchange, symbol_norm, channel) |
| `tick_files_index` | Индекс chunk-файлов: bucket key, exchange, symbol, channel, time_from, time_to, row_count, size_bytes |
| `health_events` | Критичные события: connect/disconnect, stall, DQ violations (минимум, для аудита >30 дней) |

### S3-Compatible Bucket (Railway Storage)

- **Tick-log chunks** — raw нормализованные события в NDJSON/gzip.
- **Key partitioning**: `ticks/{exchange}/{symbol_norm}/{channel}/{YYYY-MM-DD}/{HH-mm}-{chunk_id}.ndjson.gz`
- Retention: presigned URLs до 90 дней; lifecycle policy по необходимости.

## Contracts

### Channels (event types)

| Channel | Описание |
|---------|----------|
| `trades` | Сделки |
| `ticker_bbo` | Best bid/offer + 24h stats |
| `klines` | Свечи (интервал в payload) |
| `mark_index_funding` | Mark price, index price, funding rate (если доступно) |
| `open_interest` | Open interest (если доступно) |
| `orderbook_topN` | Top-N уровней стакана (N конфигурируется) |

### Event Envelope (минимальные поля)

| Поле | Тип | Описание |
|------|-----|----------|
| `exchange` | string | Код биржи (bybit, kucoin, …) |
| `market_type` | string | spot, linear, inverse |
| `symbol_raw` | string | Оригинальный символ биржи |
| `symbol_norm` | string | Нормализованный символ (BTC-USDT) |
| `channel` | string | Один из channels выше |
| `ts_exchange` | number | Timestamp биржи (ms epoch) |
| `ts_recv` | number | Timestamp получения collector'ом |
| `seq` | number? | Sequence number (если биржа даёт) |
| `event_id` | string | UUID v7 или ULID |
| `schema_version` | number | Версия схемы envelope (начинаем с 1) |
| `payload` | object | Channel-specific данные |

Обратная совместимость: новые поля добавляются опционально; удаление/переименование — только через bump schema_version + миграция.

## Reliability

- **Reconnect**: exponential backoff с jitter, max 60s.
- **Heartbeat**: абстракция ping/pong поверх WS (биржи используют разные механизмы). Stall detector: если нет данных >N секунд — reconnect + health_event.
- **DQ (Data Quality)**: проверка ts_exchange (не в будущем, не слишком старый), дедупликация по (exchange, symbol, channel, seq/ts_exchange), обнаружение пропусков seq.
- **Chunk flush**: по размеру (например 10 MB) или по времени (например 1 мин), что наступит раньше.

## Scaling Policy

- **ws-hub**: single replica — **обязательно**. Railway не поддерживает sticky sessions; при >1 реплике клиенты попадают на разные инстансы и получают неполный поток. Горизонтальное масштабирование WS возможно только с внешней pub/sub шиной (Redis, NATS), что на данном этапе избыточно.
- **md-collector**: single replica на старте. Масштабирование только после реализации планировщика подписок, который шардирует ответственность (символы/каналы) по репликам. Без шардинга — дубляж данных.
- **api-service**: stateless, можно масштабировать горизонтально через Railway replicas.

## Security (Repo A)

- Только **public market data** — никаких API keys бирж.
- Доступ к bucket: через env credentials (BUCKET_ACCESS_KEY, BUCKET_SECRET_KEY), **не хардкод**.
- Выдача tick-log наружу: через presigned URLs (генерирует api-service) или прокси-эндпоинт.
- UI ↔ ws-hub / api-service: на данном этапе без аутентификации (public data); при необходимости — JWT позже.
