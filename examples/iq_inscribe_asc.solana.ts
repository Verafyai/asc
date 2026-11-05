// Inscribe an ASC step list on Solana with IQ Labs code-in, then read it back and hash it.
// API per the @iqlabs-official/solana-sdk README (marked Draft): check signatures against the SDK source.
import iqlabs from '@iqlabs-official/solana-sdk';
import { Connection, Keypair } from '@solana/web3.js';
import { createHash } from 'node:crypto';
import steps from './hot_wallet_steps.json';

const connection = new Connection(process.env.SOLANA_RPC_URL ?? 'http://127.0.0.1:8899', 'confirmed');
iqlabs.setRpcUrl(connection.rpcEndpoint);
const signer = Keypair.fromSecretKey(/* author wallet secret key */ new Uint8Array());

const body = JSON.stringify(steps);                 // 1,909 bytes for the hot-wallet example: multi-transaction tier (900 B to 8.5 KB)
const policyTx = await iqlabs.writer.codeIn(
  { connection, signer },
  body,
  'asc-hot-wallet.json', // filename
  0,                     // method (SDK default)
  'application/json',    // filetype
);

const { metadata, data } = await iqlabs.reader.readCodeIn(policyTx);
if (data !== body) throw new Error('read-back mismatch');
const policyRef = createHash('sha256').update(data).digest('hex');
console.log({ policyTx, policyRef, metadata });      // store both on the ASC record and in each attestation
