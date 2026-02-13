# Exchange Capabilities Matrix — Repo A

Public WebSocket/REST channels available without authentication.

---

## Market Types by Exchange

| Exchange | Spot | Linear (USDT/USDC perp) | Inverse (coin perp) |
|----------|------|-------------------------|---------------------|
| Bybit    | ✅   | ✅                       | ✅                   |
| KuCoin   | ✅   | ✅ (futures separate)    | ✅                   |
| Bitget   | ✅   | ✅ (mix v2)              | ✅ (mix v2)          |
| Gate     | ✅   | ✅ (futures)             | ✅ (delivery)        |
| HTX      | ✅   | ✅ (linear-swap)         | ✅ (coin-swap)       |
| OKX      | ✅   | ✅ (SWAP)                | ✅ (SWAP)            |
| BingX    | ✅   | ✅ (perpetual swap)      | ❌                   |

---

## Channel Availability Matrix

Legend: ✅ = available public WS, 🔶 = REST only / polling, ❌ = not available.

### Spot

| Channel              | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|----------------------|-------|--------|--------|------|-----|-----|-------|
| trades               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| ticker / BBO         | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| klines               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| orderbook (snapshot)  | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| orderbook (diff/incr) | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| mark price           | ❌    | ❌     | ❌     | ❌   | ❌  | ❌  | ❌    |
| index price          | ❌    | ❌     | ❌     | ❌   | ❌  | ❌  | ❌    |
| funding rate         | ❌    | ❌     | ❌     | ❌   | ❌  | ❌  | ❌    |
| open interest        | ❌    | ❌     | ❌     | ❌   | ❌  | ❌  | ❌    |

### Linear Perpetual (USDT/USDC)

| Channel              | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|----------------------|-------|--------|--------|------|-----|-----|-------|
| trades               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| ticker / BBO         | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| klines               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| orderbook (snapshot)  | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| orderbook (diff/incr) | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| mark price           | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ✅    |
| index price          | ✅    | 🔶    | ✅     | ✅   | ✅  | ✅  | 🔶   |
| funding rate         | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | 🔶   |
| open interest        | ✅    | 🔶    | ✅     | ✅   | 🔶  | ✅  | 🔶   |

### Inverse Perpetual (Coin-margined)

| Channel              | Bybit | KuCoin | Bitget | Gate | HTX | OKX | BingX |
|----------------------|-------|--------|--------|------|-----|-----|-------|
| trades               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| ticker / BBO         | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| klines               | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| orderbook (snapshot)  | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| mark price           | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| index price          | ✅    | 🔶    | ✅     | ✅   | ✅  | ✅  | ❌    |
| funding rate         | ✅    | ✅     | ✅     | ✅   | ✅  | ✅  | ❌    |
| open interest        | ✅    | 🔶    | ✅     | ✅   | 🔶  | ✅  | ❌    |

---

## Recommended Minimal Channel Set for MVP

Для первой версии md-collector берём:

1. **trades** — все биржи, linear + spot.
2. **ticker / BBO** — все биржи, linear + spot.
3. **klines** — все биржи, linear + spot (интервал: 1m).
4. **orderbook snapshot (top 20)** — все биржи, linear + spot.

Расширение на Phase 2:

- mark price + funding rate (linear)
- open interest (linear)
- inverse market types
- orderbook incremental diff

---

## Last Verified

**Date**: 2026-02-13

### Sources

| Exchange | Documentation URL |
|----------|-------------------|
| Bybit    | https://bybit-exchange.github.io/docs/v5/ws/connect |
| KuCoin   | https://www.kucoin.com/docs-new/websocket-api/base-info/introduction |
| Bitget   | https://www.bitget.com/api-doc/common/websocket-intro |
| Gate     | https://www.gate.io/docs/developers/apiv4/ws/en/ |
| HTX      | https://www.htx.com/en-us/opend/newApiPages/ |
| OKX      | https://www.okx.com/docs-v5/en/ |
| BingX    | https://bingx-api.github.io/docs/ |
