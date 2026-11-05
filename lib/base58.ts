import { hexToBytes } from "@noble/hashes/utils.js";

const ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** Bitcoin/Solana base58 encoding, used to display hashes, pubkeys and signatures the way Solana does. */
export function base58(bytes: Uint8Array): string {
  let n = 0n;
  for (const b of bytes) n = (n << 8n) | BigInt(b);
  let out = "";
  while (n > 0n) {
    out = ALPHABET[Number(n % 58n)] + out;
    n /= 58n;
  }
  for (const b of bytes) {
    if (b !== 0) break;
    out = "1" + out;
  }
  return out;
}

export const b58 = (hex: string): string => base58(hexToBytes(hex));

export function shortB58(hex: string, n = 6): string {
  const s = b58(hex);
  return s.length <= n * 2 + 1 ? s : `${s.slice(0, n)}…${s.slice(-4)}`;
}
