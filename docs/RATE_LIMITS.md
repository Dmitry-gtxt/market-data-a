# Rate Limits — Repo A Exchanges

Все лимиты для public (unauthenticated) доступа.
Значение **Unknown** = не найдено в официальной документации.

---

## Documented WS Limits

Только подтверждённые числа из официальных docs.

| Parameter | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|-----------|-------|--------|--------|------|-----|-----|-------|
| Max connections / IP | Unknown | Unknown | 100 / IP ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | ≤ 300 / IP ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | Unknown | 3 per URL per IP ([docs](https://www.okx.com/docs-v5/en/#overview-websocket-overview)) | Unknown |
| Connect rate | 500 / 5 min ([docs](https://bybit-exchange.github.io/docs/v5/ws/connect)) | Unknown | 300 / 5 min ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | Unknown | Unknown | Unknown | Unknown |
| Max subs / connection | Unknown | 300 ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)) | 1 000 ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | Unknown | Unknown | Unknown | 200 (spot, since 2024-08) ([docs](https://bingx-api.github.io/docs/)) |
| Sub rate limit | Unknown | 100 topics / 10 s ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)) | 240 sub requests / h / conn ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | 50 requests / s per channel ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | Unknown | 3 sub req / s; 480 sub+unsub / h / conn ([docs](https://www.okx.com/docs-v5/en/#overview-websocket-overview)) | Unknown |
| Max client→server msg/s | Unknown | Unknown | 10 ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | 50 / s ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | Unknown | Unknown | Unknown |
| Forced disconnect | No fixed TTL ([docs](https://bybit-exchange.github.io/docs/v5/ws/connect)) | 24 h (token TTL) ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)) | No fixed TTL ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | No fixed TTL ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | Unknown | No fixed TTL ([docs](https://www.okx.com/docs-v5/en/)) | Unknown |

---

## Heartbeat Requirements

| Exchange | Who initiates | Format | Interval | Timeout | Source |
|----------|--------------|--------|----------|---------|--------|
| Bybit | Client | `{"op":"ping"}` → `{"op":"pong"}` | 20 s | Disconnect after 10 min without ping/data | [docs](https://bybit-exchange.github.io/docs/v5/ws/connect) |
| KuCoin | Client | `{"id":"...","type":"ping"}` → `{"type":"pong"}` | `pingInterval` from server (~18 s) | `pingTimeout` (~10 s) | [docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction) |
| Bitget | Client | raw string `"ping"` → `"pong"` | 30 s | Disconnect after 30 s without ping | [docs](https://www.bitget.com/api-doc/common/websocket-intro) |
| Gate | Client | Standard WS ping/pong frames + app-level `{"channel":"spot.ping"}` | Unknown | Unknown | [docs](https://www.gate.io/docs/developers/apiv4/ws/en/) |
| HTX | **Server** | Server sends `{"ping":<ts>}`, client responds `{"pong":<ts>}` | 20 s | 5 s (no pong → disconnect) | [docs](https://www.htx.com/en-us/opend/newApiPages/) |
| OKX | Client | raw string `"ping"` → `"pong"` | 30 s (before idle disconnect) | Disconnect after 30 s without activity | [docs](https://www.okx.com/docs-v5/en/) |
| BingX | Unknown | Unknown | Unknown | Unknown | [docs](https://bingx-api.github.io/docs/) |

---

## Documented REST Limits (Public Endpoints)

Используются для bootstrap: загрузка списка символов, initial snapshots.

| Exchange | Rate Limit | Based On | Source |
|----------|------------|----------|--------|
| Bybit | 600 req / 5 s | IP | [docs](https://bybit-exchange.github.io/docs/v5/rate-limit) |
| KuCoin | 2 000 / 30 s (public pool) | IP | [docs](https://www.kucoin.com/docs-new/rate-limit) |
| Bitget | 6 000 / min (global IP limit, Aug 2025+) | IP | [docs](https://www.bitget.com/api-doc/common/changelog) |
| Gate | Spot 900 r/s; Futures 300 r/s | IP | [docs](https://github.com/gateio/rest-v4) |
| HTX | Unknown | — | [docs](https://www.htx.com/en-us/opend/newApiPages/) |
| OKX | 20 req / 2 s (per endpoint, public) | IP | [docs](https://www.okx.com/docs-v5/en/) |
| BingX | 500 req / 10 s (market data, shared spot+futures) | IP | [docs](https://bingx.com/en/support/articles/31103871611289) |

---

## KuCoin Token Server

KuCoin требует получения токена перед WS-подключением:

- **Endpoint**: `POST /api/v1/bullet-public` (public, без auth).
- **Ответ**: `token`, `instanceServers[].endpoint`, `pingInterval`, `pingTimeout`.
- **TTL токена**: 24 часа.
- **Действие**: md-collector должен обновлять токен каждые ~23 ч (с запасом).

Источник: [KuCoin docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction).

---

## Safe Defaults for Repo A (Engineering Defaults)

> **Это НЕ лимиты бирж.** Это консервативные значения, выбранные для md-collector
> на основе самых строгих задокументированных лимитов выше.

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max WS connections per exchange | 2–3 | Минимум для разделения spot / linear; ниже лимитов всех бирж (OKX = 3 per URL) |
| Subscribe batch size | 10 topics / request | Ниже всех известных лимитов |
| Subscribe rate | 1 batch / 2 s | OKX = 3 req/s, Bitget = 240/h ≈ 4/min → безопасно |
| Ping interval | 15 s | Ниже минимального требования (KuCoin ~18 s, Bybit 20 s) |
| Reconnect backoff | Exponential: 1 s → 2 s → 4 s → … → 60 s max, + jitter ±20% | Стандартная практика |
| KuCoin token refresh | Каждые 23 ч | TTL = 24 h, запас 1 h |
| REST bootstrap rate | 2 req / s | Безопасно для всех бирж |
| Max symbols per connection | 50 | Консервативно (Bitget рекомендует <50, KuCoin max 300) |

---

## Last Verified

**Date**: 2026-02-13

### Sources

| Exchange | Rate Limits Documentation |
|----------|--------------------------|
| Bybit | https://bybit-exchange.github.io/docs/v5/rate-limit |
| KuCoin | https://www.kucoin.com/docs-new/rate-limit |
| Bitget | https://www.bitget.com/api-doc/common/websocket-intro |
| Gate | https://www.gate.io/docs/developers/apiv4/ws/en/ |
| HTX | https://www.htx.com/en-us/opend/newApiPages/ |
| OKX | https://www.okx.com/docs-v5/en/ |
| BingX | https://bingx-api.github.io/docs/ |
