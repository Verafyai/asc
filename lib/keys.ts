import { ed25519 } from "@noble/curves/ed25519.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

/**
 * Demo wallets. Keys are derived from a public seed so the demo is reproducible.
 * That makes them worthless by design: this is play money with no chain, no token and no value.
 */
export function secretFor(accountId: string): Uint8Array {
  return sha256(utf8ToBytes(`swarmchain-demo-wallet:${accountId}`));
}

export function pubkeyFor(accountId: string): string {
  return bytesToHex(ed25519.getPublicKey(secretFor(accountId)));
}

export function signHex(messageHex: string, secret: Uint8Array): string {
  return bytesToHex(ed25519.sign(hexToBytes(messageHex), secret));
}

export function verifyHex(sigHex: string, messageHex: string, pubkeyHex: string): boolean {
  try {
    return ed25519.verify(hexToBytes(sigHex), hexToBytes(messageHex), hexToBytes(pubkeyHex));
  } catch {
    return false;
  }
}
