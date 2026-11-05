---
asc: 1
name: Protocol treasury rebalancing
version: 1.0.0
applies_to: treasury_trade
outcomes:
  allow: run the trade
  shrink: run it at the largest size the rules allow
  deny: don't trade
default: deny
caps: { max_trade_usd: 2000000, max_daily_usd: 5000000 }
min_jury: { size: 5, quorum: 4, different_labs: true }   # callers can ask for more, never less
timeout: 120s
evidence:
  - trade          # sell, buy, size, venue, max slippage
  - holdings       # current mix and targets
  - market         # price, depth at the venue, recent volatility
  - reason         # the operator's written reason for the trade
---

1. Keep at least 18 months of operating costs in stablecoins after the trade.
2. Never trade on a venue that isn't on the approved list.
3. Deny a trade whose written reason is a price prediction ("SOL will go up").
   Rebalancing toward targets, paying costs and reducing risk are valid reasons.
4. Shrink any trade that would move the price by more than 1% at the venue's
   current depth.
5. Never send treasury funds to an address that isn't the venue or the treasury.
