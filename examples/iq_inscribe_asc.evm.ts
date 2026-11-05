// Inscribe the same ASC on an EVM chain with IQ Labs' Ethereum SDK.
// Networks today: 'sepolia' (default), 'monad', 'robinhood'. Ethereum mainnet is not deployed.
import iqlabs from '@iqlabs-official/ethereum-sdk';
import { Wallet, JsonRpcProvider, keccak256, toUtf8Bytes } from 'ethers';
import steps from './hot_wallet_steps.json';

iqlabs.setNetwork('sepolia');
const provider = new JsonRpcProvider(iqlabs.getRpcUrl());
const signer = new Wallet(process.env.AUTHOR_PRIVATE_KEY!, provider);
await iqlabs.assertChainMatches(signer);

const body = JSON.stringify(steps);                       // over 850 bytes: SDK uploads a linked list of chunks
const policyTx = await iqlabs.writer.codeIn(signer, body, 'asc-hot-wallet.json', 'application/json');
const { data } = await iqlabs.reader.readCodeIn(policyTx);
if (data !== body) throw new Error('read-back mismatch');

// The guarded contract stores keccak256 of the bytes; checkPolicy() attestations sign over it.
const policyRef = keccak256(toUtf8Bytes(body));
console.log({ policyTx, policyRef });
