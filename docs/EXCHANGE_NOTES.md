# Exchange Integration Notes — Repo A

Нюансы интеграции для md-collector WS-адаптеров.

---

## Bybit

### Symbol Format

- Raw: `BTCUSDT` (без разделителя).
- Normalized: `BTC-USDT`.
- Market types: отдельные WS endpoints — `/v5/public/spot`, `/v5/public/linear`, `/v5/public/inverse`.

### Endpoints

- Production: `wss://stream.bybit.com/v5/public/{category}`
- Testnet: `wss://stream-testnet.bybit.com/v5/public/{category}`

### Heartbeat

- Клиент должен отправлять `{"op":"ping"}` каждые 20 с.
- Сервер отвечает `{"op":"pong"}`.
- Без ping — disconnect через 10 мин.
- Источник: [docs](https://bybit-exchange.github.io/docs/v5/ws/connect).

### Compression

Нет (plain JSON).

### Orderbook Recovery

- Snapshot channel `orderbook.{depth}.{symbol}` (depth: 1, 25, 50, 200, 500).
- Delta channel — инкрементальные обновления.
- Sequence (`seq`) для отслеживания пропусков.
- При gap — переподписка на snapshot.

### Gotchas

- Args limit: нельзя подписываться на неограниченное количество тем в одном сообщении. (*observed, needs verify: точный лимит не документирован*)
- Разные WS endpoints для spot / linear / inverse / option.

---

## KuCoin

### Symbol Format

- Raw spot: `BTC-USDT`.
- Raw futures: `XBTUSDTM` (с суффиксом M).
- Normalized: `BTC-USDT`.

### Token Server (обязательно)

- `POST /api/v1/bullet-public` → получить `token` + `endpoint`.
- Для futures: `POST /api/v1/bullet-public` через futures base URL.
- Token TTL: 24 часа → refresh каждые ~23 ч.
- Источник: [docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction).

### Endpoints

- Spot: динамический (из token server).
- Futures: динамический (из token server).
- **Spot и futures нельзя миксовать** в одном WS-соединении.

### Heartbeat

- Клиент отправляет `{"id":"...","type":"ping"}` каждые `pingInterval` (18 с).
- Сервер отвечает `{"type":"pong"}`.
- Timeout: `pingTimeout` (≈10 с без ответа → reconnect).
- Источник: [docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction).

### Compression

Нет (plain JSON).

### Orderbook Recovery

- `/market/level2:{depth}` — snapshot (depth: 5, 50).
- Level 2 changes через отдельный topic.
- Sequence number для синхронизации.

### Gotchas

- Без token server — нет WS-подключения.
- Max 300 subscriptions/connection ([docs](https://www.kucoin.com/docs-new/websocket-api/base-info/introduction)).
- Push данных ~каждые 100 ms. (*observed, needs verify*)

---

## Bitget

### Symbol Format

- Raw spot: `BTCUSDT` (без разделителя).
- Raw mix (futures): `BTCUSDT` + `productType=USDT-FUTURES`.
- Normalized: `BTC-USDT`.

### Endpoints

- Spot public: `wss://ws.bitget.com/v2/ws/public`
- Mix public: `wss://ws.bitget.com/v2/ws/public`
- `instType` в подписке: `SPOT`, `USDT-FUTURES`, `COIN-FUTURES`, `USDC-FUTURES`.

### Heartbeat

- Клиент отправляет строку `"ping"` (не JSON!) каждые 30 с.
- Сервер отвечает строкой `"pong"`.
- Disconnect: через 30 с без ping.
- Источник: [docs](https://www.bitget.com/api-doc/common/websocket-intro).

### Compression

Нет (plain JSON, v2 API).

### Orderbook Recovery

- `books{depth}` channel (depth: 1, 5, 15, 50).
- Incremental updates через `books-update`.
- `checksum` для верификации.

### Gotchas

- Ping/pong — raw строки, не JSON ([docs](https://www.bitget.com/api-doc/common/websocket-intro)).
- 10 msg/s лимит (включая ping) — при превышении disconnect ([docs](https://www.bitget.com/api-doc/common/websocket-intro)).
- 240 subscribe-запросов / час / connection ([docs](https://www.bitget.com/api-doc/common/websocket-intro)).
- Рекомендация: ≤50 каналов на соединение. (*observed, needs verify: точная цифра не найдена*)

---

## Gate

### Symbol Format

- Raw spot: `BTC_USDT` (underscore).
- Raw futures: `BTC_USDT` (underscore).
- Normalized: `BTC-USDT`.

### Endpoints

- Spot v4: `wss://api.gateio.ws/ws/v4/`
- Futures BTC: `wss://fx-ws.gateio.ws/v4/ws/btc`
- Futures USDT: `wss://fx-ws.gateio.ws/v4/ws/usdt`

### Heartbeat

- Standard WebSocket ping/pong frames (RFC 6455).
- Также application-level: `{"channel":"spot.ping"}`.
- Источник: [docs](https://www.gate.io/docs/developers/apiv4/ws/en/).

### Compression

Нет (plain JSON для v4).

### Orderbook Recovery

- `spot.order_book_update` — diff updates.
- `spot.order_book` — полный snapshot.
- Sequence (`t`, `lastUpdateId`) для синхронизации.

### Gotchas

- Spot и futures — **разные** WebSocket endpoints и API структуры ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)).
- 50 requests/s per channel ([docs](https://www.gate.io/docs/developers/apiv4/ws/en/)).
- Futures: отдельные endpoints для BTC и USDT settle.

---

## HTX

### Symbol Format

- Raw: `btcusdt` (lowercase, без разделителя).
- Normalized: `BTC-USDT`.
- API использует lowercase символы.

### Endpoints

- Spot market: `wss://api.huobi.pro/ws` (или `wss://api-aws.huobi.pro/ws`).
- Linear swap: `wss://api.hbdm.com/linear-swap-ws`.
- Coin swap: `wss://api.hbdm.com/swap-ws`.

### Heartbeat

- **Сервер** отправляет `{"ping": <timestamp>}` каждые 20 с.
- Клиент **обязан** ответить `{"pong": <timestamp>}` (тот же timestamp!).
- Без pong → disconnect через 5 с.
- Источник: [docs](https://www.htx.com/en-us/opend/newApiPages/).

### Compression

- **Spot market WS: gzip сжатие всех сообщений.**
- Клиент обязан декомпрессировать каждое входящее сообщение.
- v2 WS (account) — без сжатия.
- **Это уникальная особенность HTX — все остальные биржи (кроме BingX swap) шлют plain JSON.**

### Orderbook Recovery

- `market.{symbol}.depth.step{N}` — snapshot.
- `market.{symbol}.mbp.{depth}` — incremental (MBP).
- Sequence для MBP-каналов.

### Gotchas

- **gzip декомпрессия обязательна** для market WS ([docs](https://www.htx.com/en-us/opend/newApiPages/)).
- Ping/pong инвертированы: сервер инициирует ping, клиент отвечает pong ([docs](https://www.htx.com/en-us/opend/newApiPages/)).
- Домен `huobi.pro` всё ещё используется (legacy).
- Futures (hbdm) — отдельный домен, отдельная структура API.

---

## OKX

### Symbol Format

- Raw: `BTC-USDT` (уже с дефисом).
- Для swap: `BTC-USDT-SWAP`.
- Normalized: `BTC-USDT` (strip `-SWAP` / `-FUTURES`).

### Endpoints

- Public: `wss://ws.okx.com:8443/ws/v5/public`
- Business (candles, etc.): `wss://ws.okx.com:8443/ws/v5/business`
- AWS: `wss://wsaws.okx.com:8443/ws/v5/public`

### Heartbeat

- Клиент отправляет строку `"ping"`.
- Сервер отвечает строкой `"pong"`.
- Disconnect после 30 с без активности.
- Источник: [docs](https://www.okx.com/docs-v5/en/).

### Compression

Нет (plain JSON).

### Orderbook Recovery

- `books` channel — incremental (checksum verification).
- `books5` / `books50-l2-tbt` — snapshot.
- Checksum (CRC32) для верификации состояния.

### Gotchas

- **3 connections per URL per IP** (public) — ([docs](https://www.okx.com/docs-v5/en/#overview-websocket-overview)).
- Некоторые каналы (candles, mark-price-candle, index-candle) на `/business` URL, не `/public`. (*observed, needs verify*)
- Subscribe rate: 3 req/s, 480/h — самый строгий лимит среди всех бирж ([docs](https://www.okx.com/docs-v5/en/#overview-websocket-overview)).
- `instType` может быть `SPOT`, `SWAP`, `FUTURES`, `OPTION`.
- Один WS может подписаться на разные `instType`.

---

## BingX

### Symbol Format

- Raw: `BTC-USDT` (с дефисом).
- Normalized: `BTC-USDT`.

### Endpoints

- Spot: `wss://open-api-ws.bingx.com/market`
- Perpetual swap: `wss://open-api-swap.bingx.com/swap-market`

### Heartbeat

- Ping/pong: формат не полностью документирован. (*needs verify*)
- Источник: [docs](https://bingx-api.github.io/docs/).

### Compression

- **gzip сжатие** для некоторых WS-сообщений (swap market). (*needs verify: не все каналы*)
- Клиент должен обрабатывать как сжатые, так и несжатые сообщения.

### Orderbook Recovery

- Snapshot only (top N levels).
- Нет incremental diff channel для spot. (*needs verify*)

### Gotchas

- **Нет inverse perpetual** — только USDT-margined ([docs](https://bingx-api.github.io/docs/)).
- Max 200 subscriptions / connection (spot, с 2024-08) ([docs](https://bingx-api.github.io/docs/)).
- Документация менее подробная, чем у других бирж.
- REST market data: shared limit 500 req / 10 s для spot + futures ([docs](https://bingx.com/en/support/articles/31103871611289)).
- gzip декомпрессия может потребоваться (аналогично HTX). (*needs verify*)

---

## Implementation Notes for md-collector

### Heartbeat Abstraction

Каждый адаптер должен реализовать:

- `sendPing()` — формат зависит от биржи (JSON, raw string, WS frame).
- `handlePong(msg)` — проверка ответа.
- `pingInterval` — конфигурируемый per exchange (15 с safe default).

Особые случаи:

- **HTX**: сервер шлёт ping, клиент отвечает pong (инвертированная логика).
- **Bitget / OKX**: raw string `"ping"` / `"pong"`.
- **KuCoin**: JSON `{"type":"ping"}`.
- **Bybit**: JSON `{"op":"ping"}`.
- **Gate**: standard WS ping/pong frames + application ping.

### Compression Abstraction

- **HTX (spot)**: все сообщения gzip → обязательная декомпрессия.
- **BingX (swap)**: возможно gzip → проверять первые байты. (*needs verify*)
- Остальные биржи: plain JSON, декомпрессия не нужна.

### Symbol Normalization

| Exchange | Raw Format | Example | Normalize To |
|----------|-----------|---------|--------------|
| Bybit | `BTCUSDT` | `BTCUSDT` | `BTC-USDT` |
| KuCoin (spot) | `BTC-USDT` | `BTC-USDT` | `BTC-USDT` |
| KuCoin (futures) | `XBTUSDTM` | `XBTUSDTM` | `BTC-USDT` |
| Bitget | `BTCUSDT` | `BTCUSDT` | `BTC-USDT` |
| Gate | `BTC_USDT` | `BTC_USDT` | `BTC-USDT` |
| HTX | `btcusdt` | `btcusdt` | `BTC-USDT` |
| OKX | `BTC-USDT` | `BTC-USDT-SWAP` | `BTC-USDT` |
| BingX | `BTC-USDT` | `BTC-USDT` | `BTC-USDT` |

### Typical Disconnect Causes

1. Missed heartbeat / ping timeout.
2. Rate limit exceeded (subscribe too fast, especially OKX).
3. Token expired (KuCoin, 24 h).
4. Server maintenance / upgrade.
5. Network instability.
6. Too many connections from same IP (OKX: 3 per URL).

---

## Last Verified

**Date**: 2026-02-13

| Exchange | Primary Documentation |
|----------|---------------------|
| Bybit | https://bybit-exchange.github.io/docs/v5/ws/connect |
| KuCoin | https://www.kucoin.com/docs-new/websocket-api/base-info/introduction |
| Bitget | https://www.bitget.com/api-doc/common/websocket-intro |
| Gate | https://www.gate.io/docs/developers/apiv4/ws/en/ |
| HTX | https://www.htx.com/en-us/opend/newApiPages/ |
| OKX | https://www.okx.com/docs-v5/en/ |
| BingX | https://bingx-api.github.io/docs/ |
