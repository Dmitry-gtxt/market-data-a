# Exchange Capabilities Matrix — Repo A

Public WebSocket and REST channels available without authentication.

---

## Market Types by Exchange

| Exchange | Spot | Linear (USDT/USDC perp) | Inverse (coin perp) |
|----------|------|-------------------------|---------------------|
| Bybit | WS | WS | WS |
| KuCoin | WS | WS (futures separate) | WS |
| Bitget | WS | WS (mix v2) | WS (mix v2) |
| Gate | WS | WS (futures) | WS (delivery) |
| HTX | WS | WS (linear-swap) | WS (coin-swap) |
| OKX | WS | WS (SWAP) | WS (SWAP) |
| BingX | WS | WS (perpetual swap) | ❌ |

---

## Channel Availability Matrix

Legend: **WS** = available via public WebSocket, **REST** = REST only / polling, **❌** = not available, **?** = not verified from primary source.

### Spot

| Channel | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|---------|-------|--------|--------|------|-----|-----|-------|
| trades | WS | WS | WS | WS | WS | WS | WS |
| ticker / BBO | WS | WS | WS | WS | WS | WS | WS |
| klines | WS | WS | WS | WS | WS | WS | WS |
| orderbook (snapshot) | WS | WS | WS | WS | WS | WS | WS |
| orderbook (diff/incr) | WS | WS | WS | WS | WS | WS | ❌ |
| mark price | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| index price | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| funding rate | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| open interest | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Linear Perpetual (USDT/USDC)

| Channel | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|---------|-------|--------|--------|------|-----|-----|-------|
| trades | WS | WS | WS | WS | WS | WS | WS |
| ticker / BBO | WS | WS | WS | WS | WS | WS | WS |
| klines | WS | WS | WS | WS | WS | WS | WS |
| orderbook (snapshot) | WS | WS | WS | WS | WS | WS | WS |
| orderbook (diff/incr) | WS | WS | WS | WS | WS | WS | ❌ |
| mark price | WS | WS | WS | WS | WS | WS | WS |
| index price | WS | ? | WS | WS | WS | WS | ? |
| funding rate | WS | WS | WS | WS | WS | WS | ? |
| open interest | WS | ? | WS | WS | ? | WS | ? |

### Inverse Perpetual (Coin-margined)

| Channel | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|---------|-------|--------|--------|------|-----|-----|-------|
| trades | WS | WS | WS | WS | WS | WS | ❌ |
| ticker / BBO | WS | WS | WS | WS | WS | WS | ❌ |
| klines | WS | WS | WS | WS | WS | WS | ❌ |
| orderbook (snapshot) | WS | WS | WS | WS | WS | WS | ❌ |
| mark price | WS | WS | WS | WS | WS | WS | ❌ |
| index price | WS | ? | WS | WS | WS | WS | ❌ |
| funding rate | WS | WS | WS | WS | WS | WS | ❌ |
| open interest | WS | ? | WS | WS | ? | WS | ❌ |

---

## Recommended Minimal Channel Set for MVP

Для первой версии md-collector берём:

1. **trades** — все биржи, linear + spot.
2. **ticker / BBO** — все биржи, linear + spot.
3. **klines** — все биржи, linear + spot (интервал: 1m).
4. **orderbook snapshot (top 20)** — все биржи, linear + spot.

Расширение на Phase 2:

- mark price + funding rate (linear).
- open interest (linear).
- inverse market types.
- orderbook incremental diff.

---

## Evidence Map

Ссылки на разделы документации, подтверждающие доступность каналов.

### Bybit

- Trades, ticker, klines, orderbook, mark/index/funding/OI (linear): [WS Public Topics](https://bybit-exchange.github.io/docs/v5/ws/connect)
- Orderbook depths (1/25/50/200/500): [WS Orderbook](https://bybit-exchange.github.io/docs/v5/websocket/public/orderbook)

### KuCoin

- Trades, ticker, klines, orderbook (spot): [Spot WS Market](https://www.kucoin.com/docs-new/websocket-api/spot-trading/market-data/introduction)
- Futures channels (mark/funding): [Futures WS](https://www.kucoin.com/docs-new/websocket-api/futures-trading/market-data/introduction)
- Index price, OI — **? не найден WS-канал**, возможно только REST.

### Bitget

- Все каналы (spot + mix v2): [WS Public Channels](https://www.bitget.com/api-doc/common/websocket-intro)
- OI, mark, funding (mix): [Mix WS Channels](https://www.bitget.com/api-doc/contract/websocket/public/overview)

### Gate

- Spot channels: [Spot WS v4](https://www.gate.io/docs/developers/apiv4/ws/en/#spot-websocket-overview)
- Futures channels (mark/funding/OI): [Futures WS v4](https://www.gate.io/docs/developers/apiv4/ws/en/#futures-websocket-overview)

### HTX

- Spot market channels: [Spot WS](https://www.htx.com/en-us/opend/newApiPages/)
- Linear swap channels: [Linear Swap WS](https://www.htx.com/en-us/opend/newApiPages/)
- OI (linear) — **? неясно, есть ли WS-канал** (возможно только REST).

### OKX

- Все каналы (единый WS, instType разделяет): [Public WS Channels](https://www.okx.com/docs-v5/en/#order-book-trading-market-data-ws-tickers-channel)
- Mark/index/funding/OI (SWAP): [Mark Price](https://www.okx.com/docs-v5/en/#public-data-websocket-mark-price-channel), [Funding](https://www.okx.com/docs-v5/en/#public-data-websocket-funding-rate-channel), [OI](https://www.okx.com/docs-v5/en/#public-data-websocket-open-interest-channel)

### BingX

- Spot + swap основные каналы: [WS API](https://bingx-api.github.io/docs/)
- Mark price (swap): подтверждено в [Swap WS docs](https://bingx-api.github.io/docs/#/en-us/swapV2/market-api.html)
- Index price, funding, OI — **? документация неполная**, нужна верификация.

---

## Last Verified

**Date**: 2026-02-13

### Sources

| Exchange | Documentation URL |
|----------|-------------------|
| Bybit | https://bybit-exchange.github.io/docs/v5/ws/connect |
| KuCoin | https://www.kucoin.com/docs-new/websocket-api/base-info/introduction |
| Bitget | https://www.bitget.com/api-doc/common/websocket-intro |
| Gate | https://www.gate.io/docs/developers/apiv4/ws/en/ |
| HTX | https://www.htx.com/en-us/opend/newApiPages/ |
| OKX | https://www.okx.com/docs-v5/en/ |
| BingX | https://bingx-api.github.io/docs/ |
