import { RawSigner, Ed25519Keypair, JsonRpcProvider } from "@mysten/sui.js";
import { fromB64 } from "@mysten/bcs";
import { IMoveAccount } from "./IMoveAccount";
var fs = require("fs");

export function makeSigner(
  provider: JsonRpcProvider,
  account: IMoveAccount
): RawSigner {
  const keypair = revertKeypairFromSecret(account.privateKey);
  const signer = new RawSigner(keypair, provider);
  return signer;
}

export function makeSigners(
  provider: JsonRpcProvider,
  accounts: IMoveAccount[]
): RawSigner[] {
  return accounts.map((account) => makeSigner(provider, account));
}

export function revertKeypairFromSecret(privateKey) {
  return Ed25519Keypair.fromSecretKey(fromB64(privateKey));
}

export async function signerByMnemonic(MNEMONIC) {
  const keypair_ed25519 = Ed25519Keypair.deriveKeypair(
    MNEMONIC,
    "m/44'/784'/0'/0'/0'"
  );
  const signer = new RawSigner(
    keypair_ed25519, // or use keypair_secp256k1 for ECDSA secp256k1
    new JsonRpcProvider("https://fullnode.testnet.sui.io/")
  );
  const address = await signer.getAddress();
  return signer;
}

export function existsAsync(path) {
  return new Promise(function (resolve, reject) {
    fs.exists(path, function (exists) {
      resolve(exists);
    });
  });
}

export function loadAccounts(path): Promise<IMoveAccount[]> {
  return new Promise((res, rej) => {
    fs.readFile(path, "utf-8", function (err, data) {
      if (err) {
        rej(err);
      }
      const accounts = JSON.parse(data) as IMoveAccount[];
      res(accounts);
    });
  });
  // const keypair_ed25519 = revertKeypairFromSecret(ex.privateKey);
}
