// Localnet settlement run. Uses throwaway keys on a local solana-test-validator (IQ program cloned from devnet).
// Writes ../data/settlement.json. Never prints secret keys.
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from "node:fs";
import iqlabs from "@iqlabs-official/solana-sdk";
const RPC = "http://127.0.0.1:8899";
const ED25519 = new PublicKey("Ed25519SigVerify111111111111111111111111111");
const MEMO = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const IQ = "9KLLchQVJpGkw4jPuUmnvqESdR7mtNCYr3qS4iQLabs";
const c = new Connection(RPC, "confirmed");
const demo = JSON.parse(fs.readFileSync("../data/demos/flight-delay.json", "utf8"));
const s = demo.scenarios[0].initial.signed;
const compact = JSON.parse(fs.readFileSync("../data/compact-flight-delay.json", "utf8"));
const hex = (h) => Buffer.from(h, "hex");
const msg = hex(s.recordHash);

// One Ed25519 precompile instruction carrying N signatures over the same 32-byte record hash.
function multiEd25519(sigs, message) {
  const n = sigs.length, head = 2 + 14 * n, data = Buffer.alloc(head + 96 * n + message.length);
  data[0] = n; data[1] = 0;
  const msgOff = head + 96 * n;
  sigs.forEach((q, i) => {
    const pkOff = head + 96 * i, sigOff = pkOff + 32, o = 2 + 14 * i;
    data.writeUInt16LE(sigOff, o); data.writeUInt16LE(0xffff, o + 2);
    data.writeUInt16LE(pkOff, o + 4); data.writeUInt16LE(0xffff, o + 6);
    data.writeUInt16LE(msgOff, o + 8); data.writeUInt16LE(message.length, o + 10); data.writeUInt16LE(0xffff, o + 12);
    hex(q.pubkey).copy(data, pkOff); hex(q.sig).copy(data, sigOff);
  });
  message.copy(data, msgOff);
  return new TransactionInstruction({ programId: ED25519, keys: [], data });
}
const out = { cluster: "localnet (solana-test-validator 4.4.0, IQ program cloned from devnet)", rpc: RPC, ranAt: new Date().toISOString(), recordHash: s.recordHash, quorum: s.quorumSigs.length, steps: [] };
const payer = Keypair.generate(), escrow = Keypair.generate(), ana = Keypair.generate();
out.payer = payer.publicKey.toBase58(); out.escrow = escrow.publicKey.toBase58(); out.payee = ana.publicKey.toBase58();
for (const k of [payer, escrow]) await c.confirmTransaction(await c.requestAirdrop(k.publicKey, 5 * LAMPORTS_PER_SOL), "confirmed");
// 500 play units -> 5,000,000 lamports (0.005 localnet SOL), a stand-in. Real play money has no on-chain form.
const paid = s.record.settlement.payouts.reduce((a, p) => a + p.paid, 0);
const settleTx = (sigs) => new Transaction().add(
  multiEd25519(sigs, msg),
  new TransactionInstruction({ programId: MEMO, keys: [], data: Buffer.from(`swarmchain.judgment/1 ${compact.rh}`) }),
  SystemProgram.transfer({ fromPubkey: escrow.publicKey, toPubkey: ana.publicKey, lamports: paid * 10000 }));
try {
  const tx = settleTx(s.quorumSigs); tx.feePayer = payer.publicKey;
  const sig = await sendAndConfirmTransaction(c, tx, [payer, escrow]);
  out.steps.push({ name: "settle: Ed25519 precompile verifies all quorum signatures over the record hash, memo, transfer", ok: true, sig, bytes: tx.serialize().length, payeeLamports: await c.getBalance(ana.publicKey) });
} catch (e) { out.steps.push({ name: "settle", ok: false, error: String(e.message).slice(0, 300) }); }
try {
  const bad = s.quorumSigs.map((q, i) => (i === 2 ? { ...q, sig: q.sig.slice(0, -2) + (q.sig.endsWith("00") ? "01" : "00") } : q));
  const tx = settleTx(bad); tx.feePayer = payer.publicKey;
  const before = await c.getBalance(ana.publicKey);
  const sig = await sendAndConfirmTransaction(c, tx, [payer, escrow], { skipPreflight: true });
  out.steps.push({ name: "tampered signature", ok: false, unexpected: "tx succeeded", sig });
} catch (e) {
  out.steps.push({ name: "tampered signature (one quorum sig altered): whole tx must fail, no transfer", ok: true, rejected: true, error: String(e.message).slice(0, 240), payeeLamportsAfter: await c.getBalance(ana.publicKey) });
}
try {
  iqlabs.setRpcUrl(RPC);
  const sig = await iqlabs.writer.codeIn({ connection: c, signer: payer }, JSON.stringify(compact), "judgment-flight-delay.json");
  out.steps.push({ name: "IQ Labs codeIn inscription of compact record", ok: true, sig, bytes: JSON.stringify(compact).length });
  try { const r = await iqlabs.reader.readCodeIn(sig); out.steps.push({ name: "IQ readCodeIn round trip", ok: r.data === JSON.stringify(compact), metadata: String(r.metadata).slice(0, 200) }); }
  catch (e) { out.steps.push({ name: "IQ readCodeIn", ok: false, error: String(e.message).slice(0, 300) }); }
} catch (e) { out.steps.push({ name: "IQ Labs codeIn inscription", ok: false, error: String(e.message || e).slice(0, 400) }); }
fs.writeFileSync("../data/settlement.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out, null, 1));
