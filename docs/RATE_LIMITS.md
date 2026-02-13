# Rate Limits — Repo A Exchanges

Все лимиты для public (unauthenticated) доступа.

---

## WebSocket Limits

| Exchange | Max Connections / IP | Connect Rate | Max Subs / Connection | Sub Rate Limit | Max Messages / s (client→server) | Heartbeat | Forced Disconnect |
|----------|---------------------|--------------|-----------------------|----------------|----------------------------------|-----------|-------------------|
| Bybit | 1 000 (per market type) | 500 / 5 min | ~unlimited (args limit per topic) | Not specified | Not specified | Ping every 20 s; disconnect after 10 min without ping/data ([docs](https://bybit-exchange.github.io/docs/v5/ws/connect)) | No fixed TTL |
| KuCoin | Not documented (practical ~50) | Not documented | 300 (per token docs) | 100 topics / 10 s ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)) | Not specified | Ping every `pingInterval` (18 s from server); timeout after `pingTimeout` (~10 s) ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)) | 24 h (token TTL) |
| Bitget | 100 / IP | 300 / 5 min | 1 000 | 240 sub requests / h / connection | 10 ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | String "ping" every 30 s; disconnect after 30 s without ping ([docs](https://www.bitget.com/api-doc/common/websocket-intro)) | No fixed TTL |
| Gate | ≤ 300 / IP | Not documented | Not documented | 50 requests / s per channel ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | 50 / s | Client ping/pong (standard WS frames) ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)) | No fixed TTL |
| HTX | Not documented | Not documented | Not documented | Not documented | Not documented | Server sends "ping" every 20 s; client must "pong" within 5 s ([docs](https://www.htx.com/en-us/opend/newApiPages/)) | No fixed TTL |
| OKX | 3 (per URL per IP, public) | Not documented | Not specified (practical ~100) | 3 sub requests / s; 480 sub+unsub / h / connection ([docs](https://www.okx.com/docs-v5/en/)) | 3 / s | Ping "ping" → "pong"; disconnect after 30 s without activity ([docs](https://www.okx.com/docs-v5/en/)) | No fixed TTL |
| BingX | Not documented | Not documented | 200 (spot, since 2024-08) | Not documented | Not documented | Ping/pong (implementation-specific) ([docs](https://bingx-api.github.io/docs/)) | No fixed TTL |

---

## REST Limits (Public Endpoints)

Используются для bootstrap: загрузка списка символов, initial snapshots.

| Exchange | Rate Limit | Based On | Source |
|----------|------------|----------|--------|
| Bybit | 600 req / 5 s | IP | [docs](https://bybit-exchange.github.io/docs/v5/rate-limit) |
| KuCoin | 2 000 / 30 s (public pool) | IP | [docs](https://www.kucoin.com/docs-new/rate-limit) |
| Bitget | 6 000 / min (global IP limit, Aug 2025+) | IP | [docs](https://www.bitget.com/api-doc/common/changelog) |
| Gate | Spot 900 r/s; Futures 300 r/s | IP (spot) / IP (futures) | [docs](https://github.com/gateio/rest-v4) |
| HTX | Not clearly documented for public | — | [docs](https://www.htx.com/en-us/opend/newApiPages/) |
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

## Safe Defaults for Repo A

Консервативные значения для md-collector (single replica):

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Max WS connections per exchange | 2–3 | Минимум для разделения spot / linear; запас ниже лимитов всех бирж |
| Subscribe batch size | 10 topics / request | Ниже всех известных лимитов |
| Subscribe rate | 1 batch / 2 s | OKX = 3 req/s, Bitget = 240/h ≈ 4/min → безопасно |
| Ping interval | 15 s | Ниже минимального требования (KuCoin 18 s, Bybit 20 s) |
| Reconnect backoff | Exponential: 1 s → 2 s → 4 s → … → 60 s max, + jitter ±20% | Стандартная практика |
| KuCoin token refresh | Каждые 23 ч | TTL = 24 h, запас 1 h |
| REST bootstrap rate | 2 req / s | Безопасно для всех бирж |
| Max symbols per connection | 50 | Консервативно (Bitget рекомендует <50, KuCoin 300 но практика 50) |

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
