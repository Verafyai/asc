// Inscribed-contract run on a local solana-test-validator (IQ program cloned from devnet).
// No model calls: verdicts are scripted from the inscribed rules. Writes ../data/inscribed.json. Never prints secrets.
import { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction, TransactionInstruction, sendAndConfirmTransaction } from "@solana/web3.js";
import fs from "node:fs"; import crypto from "node:crypto";
import iqlabs from "@iqlabs-official/solana-sdk";
const RPC = "http://127.0.0.1:8899";
const ED25519 = new PublicKey("Ed25519SigVerify111111111111111111111111111");
const MEMO = new PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
const c = new Connection(RPC, "confirmed");
const sha = (x) => crypto.createHash("sha256").update(x).digest();
const rec = JSON.parse(fs.readFileSync("../data/demos/flight-delay.json", "utf8")).scenarios[0].initial.signed.record; // only for operator ids/models
const ops = rec.committee.slice(0, 5); // five model operators, one Solana wallet each
const wallets = ops.map((o) => Keypair.fromSeed(sha(`swarmchain-inscribed-wallet:${o.id}`)));
const edSign = (m, seed) => crypto.sign(null, m, crypto.createPrivateKey({ key: Buffer.concat([Buffer.from("302e020100300506032b657004220420", "hex"), Buffer.from(seed)]), format: "der", type: "pkcs8" }));
const memo = (s, signer) => new TransactionInstruction({ programId: MEMO, keys: [{ pubkey: signer, isSigner: true, isWritable: false }], data: Buffer.from(s) });
function multiEd25519(items, message) {
  const n = items.length, head = 2 + 14 * n, data = Buffer.alloc(head + 96 * n + message.length);
  data[0] = n; const msgOff = head + 96 * n;
  items.forEach((q, i) => { const pk = head + 96 * i, so = pk + 32, o = 2 + 14 * i;
    data.writeUInt16LE(so, o); data.writeUInt16LE(0xffff, o + 2); data.writeUInt16LE(pk, o + 4); data.writeUInt16LE(0xffff, o + 6);
    data.writeUInt16LE(msgOff, o + 8); data.writeUInt16LE(message.length, o + 10); data.writeUInt16LE(0xffff, o + 12);
    Buffer.from(q.pubkey).copy(data, pk); Buffer.from(q.sig).copy(data, so); });
  message.copy(data, msgOff);
  return new TransactionInstruction({ programId: ED25519, keys: [], data });
}
// 1. Treasury contract (ILLUSTRATIVE): plain-English rules compiled to a loop-free step list + run rules.
const PER_UNREG = 1_000_000, DAILY = 50_000_000, DELAY_H = 24, BAL = 2_000_000_000;
const registered = Keypair.generate(); // a wallet on the registered list (illustrative)
const english = [
  "Never send more than $1,000,000 to a wallet not registered to Binance.",
  "Never send more than $50,000,000 in total per day.",
  "Only pay out to wallets on the declared withdrawal list.",
  "A newly registered address cannot receive funds until 24 hours after registration.",
  "Never send more than 10% of the hot wallet balance in one withdrawal.",
  "If any rule is broken, refuse the withdrawal and hold it for human review." ];
const doc = { kind: "swarmchain.steps/1", title: "Exchange hot wallet: withdrawal rules (illustrative)", english,
  steps: [
    { n: 1, op: "read_input", what: "withdrawal request: to, amountUsd, registered, sentTodayUsd, registeredHoursAgo" },
    { n: 2, op: "judge", rule: "unregistered_cap", test: "registered || amountUsd <= 1000000" },
    { n: 3, op: "judge", rule: "daily_cap", test: "sentTodayUsd + amountUsd <= 50000000" },
    { n: 4, op: "judge", rule: "declared_list", test: "to in declaredList" },
    { n: 5, op: "judge", rule: "new_address_delay", test: "registeredHoursAgo >= 24" },
    { n: 6, op: "judge", rule: "balance_share", test: "amountUsd <= 0.10 * hotWalletBalanceUsd" },
    { n: 7, op: "exit", requires: "quorum of allow attestations", else: "refuse + hold" } ],
  runRules: { quorum: 4, of: 5, operators: wallets.map((w, i) => ({ id: ops[i].id, model: ops[i].model, wallet: w.publicKey.toBase58() })),
    declaredList: [registered.publicKey.toBase58()], hotWalletBalanceUsd: BAL, loops: "none" } };
const docStr = JSON.stringify(doc);
const out = { cluster: "localnet (solana-test-validator 4.4.0, IQ program cloned from devnet)", ranAt: new Date().toISOString(), modelCallsUsd: 0,
  note: "Verdicts are scripted from the inscribed rules (no model calls were made for this run). Signatures, inscriptions and transfers are real on a local validator.", stepsDoc: doc, calls: [], steps: [] };
const payer = Keypair.generate(), treasury = Keypair.generate(), attacker = Keypair.generate();
for (const k of [payer, treasury, attacker, ...wallets]) await c.confirmTransaction(await c.requestAirdrop(k.publicKey, 2 * LAMPORTS_PER_SOL), "confirmed");
out.treasury = treasury.publicKey.toBase58(); out.registeredWallet = registered.publicKey.toBase58();
iqlabs.setRpcUrl(RPC);
const stepsSig = await iqlabs.writer.codeIn({ connection: c, signer: payer }, docStr, "hot-wallet-withdrawal-rules.json");
const back = await iqlabs.reader.readCodeIn(stepsSig);
out.steps.push({ name: "Inscribe hot-wallet rules as loop-free steps + run rules via IQ Labs codeIn", ok: true, sig: stepsSig, bytes: docStr.length });
out.steps.push({ name: "IQ readCodeIn round trip (byte-identical)", ok: back.data === docStr });
const judge = (r) => { const f = [], reg = doc.runRules.declaredList.includes(r.to);
  if (!reg && r.amountUsd > PER_UNREG) f.push("unregistered_cap"); if (r.sentTodayUsd + r.amountUsd > DAILY) f.push("daily_cap");
  if (!reg) f.push("declared_list"); if (r.registeredHoursAgo < DELAY_H) f.push("new_address_delay");
  if (r.amountUsd > 0.1 * BAL) f.push("balance_share"); return { ruling: f.length ? "deny" : "allow", broken: f }; };
const exitTx = (ss, msg, to, lamports) => { const t = new Transaction().add(multiEd25519(ss, msg), memo(`swarmchain.exit/1 ${msg.toString("hex").slice(0, 32)}`, payer.publicKey),
  SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: to, lamports })); t.feePayer = payer.publicKey; return t; };
const scenarios = [
  { id: "normal", label: "Normal payout: $250,000 to a registered wallet", req: { to: registered.publicKey.toBase58(), amountUsd: 250_000, sentTodayUsd: 4_000_000, registeredHoursAgo: 720 }, caller: payer, toKey: registered.publicKey },
  { id: "drain", label: "Hypothetical drain: $6,000,000,000 to an unregistered wallet", req: { to: attacker.publicKey.toBase58(), amountUsd: 6_000_000_000, sentTodayUsd: 4_000_000, registeredHoursAgo: 0 }, caller: attacker, toKey: attacker.publicKey } ];
for (const sc of scenarios) {
  const inputHash = sha(JSON.stringify(sc.req)).toString("hex");
  const callSig = await sendAndConfirmTransaction(c, new Transaction().add(memo(`swarmchain.call/1 rules=${stepsSig.slice(0, 16)} input=${inputHash.slice(0, 16)}`, sc.caller.publicKey)), [sc.caller]);
  const v = judge(sc.req), actionHash = sha(`${sc.req.to}|${sc.req.amountUsd}`).toString("hex");
  const atts = [];
  for (const [i, w] of wallets.entries()) {
    const att = { kind: "jury.attestation/0", rulesRef: stepsSig, call: callSig, inputHash, actionHash, modelId: ops[i].model, ruling: v.ruling, broken: v.broken, proof: "none (ZK planned)", wallet: w.publicKey.toBase58() };
    const h = sha(JSON.stringify(att));
    const vote = await sendAndConfirmTransaction(c, new Transaction().add(memo(`swarmchain.vote/1 ${h.toString("hex").slice(0, 32)} ${v.ruling}`, w.publicKey)), [w]);
    atts.push({ ...att, attHash: h.toString("hex"), sig: edSign(h, w.secretKey.slice(0, 32)).toString("hex"), voteTx: vote, _pk: w.publicKey.toBytes(), _h: h });
  }
  const allows = atts.filter((a) => a.ruling === "allow");
  const rec2 = { id: sc.id, label: sc.label, request: sc.req, callTx: callSig, ruling: v.ruling, broken: v.broken, allowCount: allows.length, quorum: doc.runRules.quorum };
  if (allows.length >= doc.runRules.quorum) {
    // all attestations here are over the same fields except wallet/model, so each signs its own hash; verify each with its own message
    const t = new Transaction(); allows.forEach((a) => t.add(multiEd25519([{ pubkey: a._pk, sig: Buffer.from(a.sig, "hex") }], a._h)));
    t.add(memo(`swarmchain.exit/1 ${actionHash.slice(0, 32)}`, payer.publicKey), SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: sc.toKey, lamports: 5_000_000 }));
    t.feePayer = payer.publicKey; const before = await c.getBalance(sc.toKey);
    const sig = await sendAndConfirmTransaction(c, t, [payer, treasury]);
    rec2.exitTx = sig; rec2.exitBytes = t.serialize().length; rec2.paidLamports = (await c.getBalance(sc.toKey)) - before;
    out.steps.push({ name: `${sc.label}: 5 of 5 jurists allow, exit tx verifies each wallet's signed attestation and pays`, ok: true, sig, bytes: rec2.exitBytes });
    try { const a0 = allows[0]; const bad = Buffer.from(a0.sig, "hex"); bad[0] ^= 1;
      const t2 = new Transaction(); allows.forEach((a, i) => t2.add(multiEd25519([{ pubkey: a._pk, sig: i === 0 ? bad : Buffer.from(a.sig, "hex") }], a._h)));
      t2.add(SystemProgram.transfer({ fromPubkey: treasury.publicKey, toPubkey: sc.toKey, lamports: 1 })); t2.feePayer = payer.publicKey;
      await sendAndConfirmTransaction(c, t2, [payer, treasury], { skipPreflight: true }); out.steps.push({ name: "tampered attestation", ok: false });
    } catch { out.steps.push({ name: "Same exit with one attestation signature altered: whole tx fails, nothing paid", ok: true, rejected: true }); }
  } else {
    out.steps.push({ name: `${sc.label}: ${allows.length} of 5 jurists allow (rules broken: ${v.broken.join(", ")}), no exit tx can be built, held for review`, ok: true, rejected: true });
  }
  rec2.attestations = atts.map(({ _pk, _h, ...a }) => a);
  out.calls.push(rec2);
}
fs.writeFileSync("../data/inscribed.json", JSON.stringify(out, null, 1));
console.log(JSON.stringify(out.steps, null, 1));
