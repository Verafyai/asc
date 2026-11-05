// Private ASC: encrypt the rules to every juror's wallet-derived X25519 key, inscribe only the ciphertext.
// Works the same with @iqlabs-official/ethereum-sdk (same crypto namespace).
import iqlabs from '@iqlabs-official/solana-sdk';
import { createHash } from 'node:crypto';

// Each juror publishes its X25519 public key once, derived from its wallet:
//   const sign = async (msg: Uint8Array) => wallet.signMessage(msg);
//   const { pubKey } = await iqlabs.crypto.deriveX25519Keypair(sign);
const jurorPubKeys: string[] = [/* hex X25519 pubkeys from the jurors table */];

export async function inscribePrivateAsc(input: { connection: any; signer: any }, rulesJson: string) {
  const plaintextRef = createHash('sha256').update(rulesJson).digest('hex'); // jurors attest to this
  const encrypted = iqlabs.crypto.multiEncrypt(jurorPubKeys, new TextEncoder().encode(rulesJson)); // { recipients, iv, ciphertext }
  const envelope = JSON.stringify({ kind: 'asc.private/1', plaintextRef, encrypted });
  const policyTx = await iqlabs.writer.codeIn(input, envelope, 'asc-private.json', 0, 'application/json');
  return { policyTx, plaintextRef };
}

// Juror side:
//   const { metadata, data } = await iqlabs.reader.readCodeIn(policyTx);
//   const { plaintextRef, encrypted } = JSON.parse(data!);
//   const rules = iqlabs.crypto.multiDecrypt(privKey, pubKey, encrypted);   // Uint8Array
//   check sha256(rules) === plaintextRef before judging.
