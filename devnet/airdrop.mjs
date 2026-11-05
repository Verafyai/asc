import { Connection, Keypair, LAMPORTS_PER_SOL } from "@solana/web3.js";
import fs from "node:fs";
const P = "/workspace/swarmchain-devnet-secrets/payer.json";
let kp;
if (fs.existsSync(P)) kp = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(fs.readFileSync(P, "utf8"))));
else { kp = Keypair.generate(); fs.writeFileSync(P, JSON.stringify([...kp.secretKey]), { mode: 0o600 }); }
const c = new Connection("https://api.devnet.solana.com", "confirmed");
console.log("payer", kp.publicKey.toBase58(), "genesis", await c.getGenesisHash());
try { const s = await c.requestAirdrop(kp.publicKey, 2 * LAMPORTS_PER_SOL); await c.confirmTransaction(s, "confirmed"); console.log("airdrop ok", s); } catch (e) { console.log("airdrop failed:", e.message.slice(0, 200)); }
console.log("balance", (await c.getBalance(kp.publicKey)) / LAMPORTS_PER_SOL);
