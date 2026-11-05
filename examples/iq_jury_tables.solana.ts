// Public juror registry and rulings log as IQ Labs tables. The escrow program still verifies
// Ed25519 signatures itself; the tables are the public, append-only record anyone can read.
import iqlabs from '@iqlabs-official/solana-sdk';

const DB = 'asc';
export async function setup(connection: any, signer: any) {
  await iqlabs.writer.createTable(connection, signer, DB, 'jurors', 'jurors',
    ['wallet', 'family', 'model', 'x25519Pub', 'addedAt'], 'wallet', [], undefined, [/* writer allowlist: ASC admin */]);
  await iqlabs.writer.createTable(connection, signer, DB, 'rulings', 'rulings',
    ['policyRef', 'actionHash', 'ruling', 'wallet', 'sig', 'at'], 'actionHash', []);
}

export async function logRuling(connection: any, jurorSigner: any, row: Record<string, string>) {
  return iqlabs.writer.writeRow(connection, jurorSigner, DB, 'rulings', JSON.stringify(row));
}

// Readers: iqlabs.reader.readTableRows(<table account>, { limit: 50 })
