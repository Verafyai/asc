---
asc: 1
name: Exchange hot wallet withdrawals
version: 1.0.0
applies_to: withdrawal
outcomes:
  allow: send the withdrawal
  hold: refuse, freeze the request and page the on-call reviewer
default: hold            # used on timeout, no quorum or bad evidence
min_jury: { size: 5, quorum: 4, different_labs: true }   # callers can ask for more, never less
timeout: 90s
evidence:
  - request          # to, amount_usd, asset, chain
  - account          # age, kyc_level, recent security changes
  - destination      # registered?, hours since registration, prior use
  - ticket           # the support ticket or chat that asked for it, if any
  - totals           # sent today, hot wallet balance
---

# Hard limits
1. Never send more than $1,000,000 to a wallet not registered to the exchange.
2. Never send more than $50,000,000 in total per day.
3. Never send more than 10% of the hot wallet balance in one withdrawal.
4. A newly registered address cannot receive funds until 24 hours after registration.

# Judgment
5. Hold the withdrawal if it looks like an account takeover: a password, email or
   2FA change in the last 48 hours, followed by a withdrawal to an address the
   account has never used.
6. Hold the withdrawal if the support ticket that asked for it shows signs of
   social engineering: urgency, a claim to be staff or law enforcement, or a
   request to skip a normal check.
7. If any rule is broken, or you can't tell, hold.
