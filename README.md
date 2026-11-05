# Actually Smart Contracts

Canonical site: https://asc.verafy.ai

Actually Smart Contracts (ASC) is a Verafy research prototype. Rules written in plain language are compiled into a checked step list and inscribed on Solana with IQ Labs code-in. An AI jury reads the rules, votes, and signs the result. It settles on Solana. No coin, no token, play money only.

The product name is the `PRODUCT_NAME` constant in `lib/brand.ts`.

## Pages

- `/` Home
- `/how-it-works` Mechanism, diagrams, the 30-event pilot, spend
- `/sandbox` Free in-browser simulator. No model calls.
- `/docs` Docs, including trust, credits, and recorded runs
- `/code` Sample code
- `/standards` Standards rendered from `asc-standards/`
- `/certify` Certify flow and the example certificate
- `/performance` Costs computed from `data/performance-model.json`
- `/security` Provable inference and the threat model
- `/inscribed` Hot-wallet ASC run
- `/proposal` checkPolicy() proposal

Old URLs redirect: `/trust`, `/demos`, `/contracts`, `/settlement`, `/evidence`, `/asc`.

## Honesty

- **real:** recorded model calls in `data/demos/`, and the local validator settlement and inscription.
- **illustrative:** demo evidence, parties, and PLAY amounts.
- **design only:** proof of which model answered (Anthropic's FlashProve is research, not live here), EVM checkPolicy, private ASCs.
- The hot-wallet verdicts were scripted from the rules. No model calls were made for that run.

## Credits

Prices are placeholders in `config/pricing.ts`. The Verafy credits API is not connected. Quotes are shown, then Confirm. Nothing is charged. There are no free credits.

## Run

```
npm i && npm test && npm run build
npm run dev
```

Re-recording demos spends money and is off by default. Live mode needs `SWARM_LIVE=1` and `OPENROUTER_API_KEY` on the server. Do not commit secrets.

```
cd devnet && npm i && node settle-localnet.mjs
```

The localnet scripts need a solana-test-validator with the IQ program cloned.
