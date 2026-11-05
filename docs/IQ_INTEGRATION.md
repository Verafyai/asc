# Built on IQ Labs: exact APIs used by Actually Smart Contracts

IQ Labs provides the on-chain storage, tables and encryption. ASC adds the compiler, the AI jury, the signed rulings and the escrow. Checked Nov 4, 2026 against IQ Labs' docs and GitHub. The Solana SDK README is marked **Draft**, so check signatures against the SDK source before shipping.

## Packages
| Chain | Package | Import | Docs |
|---|---|---|---|
| Solana | `@iqlabs-official/solana-sdk` | `import iqlabs from '@iqlabs-official/solana-sdk'` | github.com/IQCoreTeam/iqlabs-solana-sdk |
| EVM | `@iqlabs-official/ethereum-sdk` (ethers v6) | `import iqlabs from '@iqlabs-official/ethereum-sdk'` | iqlabs.mintlify.app/docs-ethereum, github.com/IQCoreTeam/iq-ethereum-sdk |
| Python (Solana) | `iqlabs-solana-sdk-python` | | github.com/IQCoreTeam/iqlabs-solana-sdk-python |

## What ASC uses, and for what
| ASC need | IQ Labs API | Notes |
|---|---|---|
| Inscribe the compiled step list | Solana: `writer.codeIn({connection, signer}, data, filename?, method=0, filetype='', onProgress?) → signature`. EVM: `writer.codeIn(signer, data, filename?, filetype?, onProgress?) → txHash` | Solana tiers: under 900 B one transaction; 900 B to 8.5 KB several; 8.5 KB and up in parallel. EVM chunks are 850 B in a linked list. The hot-wallet steps are 1,909 B |
| Read it back and verify | Solana: `reader.readCodeIn(txSignature, speed?, onProgress?) → {metadata, data}`. EVM: `reader.readCodeIn(txHash, onProgress?)` | ASC stores `policyTx` (the IQ transaction id) and `policyRef` (SHA-256 of `data` on Solana, keccak256 on EVM). Every attestation signs over `policyRef` |
| Private ASCs | `crypto.deriveX25519Keypair(signMessage)` per juror; `crypto.multiEncrypt(recipientPubHexes, plaintext)`; juror reads with `crypto.multiDecrypt(privKey, pubKeyHex, encrypted)` | Inscribe only the envelope `{plaintextRef, encrypted}`. Jurors check `sha256(decrypted) === plaintextRef` before judging. Limit: any juror can leak the rules; the chain can't check the plaintext |
| Juror registry | `writer.createTable(...)`, columns `wallet, family, model, x25519Pub`, `writers` allowlist = ASC admin | Wallet = juror identity (same model as IQ's AgentNet: one wallet, one agent) |
| Public rulings log | `writer.writeRow(...)` into `rulings`; `reader.readTableRows(...)` | The escrow program still verifies Ed25519 signatures itself; the table is the readable record |
| Deliver a private request to the jury (optional) | `writer.requestConnection`, `writer.writeConnectionRow`, `reader.readConnectionRows` with `crypto.dhEncrypt` | For requests that carry private evidence |
| EVM networks | `setNetwork('sepolia' \| 'monad' \| 'robinhood')`, `assertChainMatches(signer)` | Contracts: Sepolia `0x246A08D9fdD9b3990A88eD1f2DF1A87239839F07`, Monad `0x7ae06f87Cf93606DA2BD6A281afB28028cAE233D`, Robinhood Chain `0x88af59e58C7E5DcbE7cc12972B90cff3fEEF7223`. **Ethereum mainnet is not deployed** |
| Fees | EVM: `utils.resolveCodeInFee`, `utils.getBasicFee`, `utils.getLinkedListFee` | Show the inscription cost before the author signs |

## What ASC builds itself (not in IQ Labs)
- English to loop-free step compiler and loophole checker; human sign-off.
- The AI jury: juror harness, commit-reveal, quorum, dispute jury.
- Escrow program with hard caps, verifying juror Ed25519 signatures in the payout transaction (Solana precompile) or a two-step request/release contract on EVM (`checkPolicy`).
- Proof of which model answered: planned, following Anthropic's FlashProve prototype; not built.

## Open checks before shipping
1. Solana program ID and devnet/mainnet deployments: not stated in the README (the localnet run cloned IQ's program from devnet).
2. Solana `writer.createTable` takes a `tableSeed` and `tableName`; confirm the `rulings` table can accept rows from many juror wallets (`writers` allowlist or `gate`).
3. `multiEncrypt` recipient limit and envelope size: keep the envelope under 8.5 KB.
4. IQ Labs' terms for commercial use of the SDKs (Apache-2.0 on GitHub) and their fees.
