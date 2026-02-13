# Instrument Catalog

## Назначение

Каталог инструментов — центральный реестр всех символов и рынков, доступных на подключённых биржах.
Используется planner'ом для формирования подписок и UI для отображения доступных инструментов.

---

## Таблицы (PostgreSQL)

| Таблица | Назначение |
|---------|------------|
| `markets` | Реестр рынков: (exchange, market_type). Каждая биржа может иметь spot, linear, inverse. |
| `symbols` | Нормализованные символы (PK: `symbol_norm`). Например `BTC-USDT`. |
| `symbol_aliases` | Связь raw-символа биржи с нормализованным. PK: (exchange, market_type, symbol_raw). |
| `exchange_capabilities` | Мета-данные биржи: поддержка книг, фандинга, OI. |

---

## Нормализация символов (symbol_norm)

Формат: `BASE-QUOTE` (uppercase).

### Правила

1. Uppercase + trim.
2. Убрать суффиксы: `-SWAP`, `-PERP`, `-FUTURES`, `-SPOT`, `_PERP`, `_SWAP`.
3. Убрать trailing `M` (KuCoin futures: `XBTUSDTM` → `XBTUSDT`).
4. Алиасы: `XBT` → `BTC`.
5. Разделители: `-`, `/`, `_` → split на base/quote.
6. Без разделителя: greedy suffix match по списку quote-валют (USDT, USDC, BTC, ETH…).

### Примеры

| Raw | Биржа | symbol_norm |
|-----|-------|-------------|
| `BTCUSDT` | Bybit | `BTC-USDT` |
| `BTC-USDT-SWAP` | OKX | `BTC-USDT` |
| `XBTUSDTM` | KuCoin | `BTC-USDT` |
| `BTC_USDT` | Gate | `BTC-USDT` |
| `ETH/BTC` | — | `ETH-BTC` |

---

## Синхронизация (sync)

### Запуск

- **On boot**: `INSTRUMENTS_SYNC_ON_BOOT=true`
- **Periodic**: `INSTRUMENTS_SYNC_INTERVAL_MIN=60` (каждые 60 мин)
- **HTTP**: `POST /admin/instruments/sync` (internal-only)

### Ответ

```json
{
  "ok": true,
  "synced_exchanges": ["bybit", "okx"],
  "counts": { "bybit": 1234, "okx": 890 },
  "errors": []
}
```

### Mutex

Параллельный sync блокируется in-memory mutex. Повторный вызов вернёт ошибку.

---

## Реализованные загрузчики

| Биржа | Статус | Endpoint |
|-------|--------|----------|
| Bybit | ✅ Done | `GET /v5/market/instruments-info` |
| OKX | ✅ Done | `GET /api/v5/public/instruments` |
| KuCoin | 🔲 TODO | — |
| Bitget | 🔲 TODO | — |
| Gate | 🔲 TODO | — |
| HTX | 🔲 TODO | — |
| BingX | 🔲 TODO | — |

---

## UI (Vercel)

Страница `/catalog`:

- **Tab Symbols**: таблица с поиском (symbol_norm, base, quote).
- **Tab Markets**: таблица с фильтрами (exchange, market_type).
- Данные: `GET /symbols` и `GET /markets` из api-service.
- Env: `VITE_API_URL` → URL api-service.

---

## Env переменные

### Railway (md-collector)

| Var | Описание |
|-----|----------|
| `INSTRUMENTS_SYNC_ON_BOOT` | `true` для авто-sync при старте |
| `INSTRUMENTS_SYNC_INTERVAL_MIN` | Интервал periodic sync (минуты) |

### Railway (api-service)

| Var | Описание |
|-----|----------|
| `ALLOWED_ORIGINS` | Comma-separated CORS origins (Vercel URL) |

### Vercel (UI)

| Var | Описание |
|-----|----------|
| `VITE_API_URL` | URL api-service (Railway) |
