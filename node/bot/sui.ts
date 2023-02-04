import { JsonRpcProvider, RawSigner, Ed25519Keypair } from "@mysten/sui.js";
import { IMoveAccount } from "./IMoveAccount";
import { existsAsync as accountExists, loadAccounts } from "./utils";

const MNOMIC = process.env.SUI_MNEMONIC || "";
const PATH = "accounts.json";

export async function sui() {
  const provider = new JsonRpcProvider("https://fullnode.testnet.sui.io/", {
    faucetURL: "",
  });

  let isWalletsGenerated = await accountExists(PATH);
  let accounts: IMoveAccount[] = [];
  if (isWalletsGenerated) {
    accounts = await loadAccounts(PATH);
  } else {
    accounts = await generateAccounts(provider);
  }

  const admin = await mainWalletSigner(provider);
  const adminBalance = await provider.getBalance(await admin.getAddress());
  const balanceNative = adminBalance.totalBalance * 10e-10;

  const tx = await admin.transferSui({
    suiObjectId: "0x2::coin::Coin<0x2::sui::SUI>",
    amount: balanceNative / 200,
    gasBudget: 1000,
    recipient: accounts[0].publicKey,
  });

  const balanceAfter = await provider.getBalance(accounts[0].publicKey);
}

async function generateAccounts(provider, count = 2): Promise<IMoveAccount[]> {
  let generatedAccounts: IMoveAccount[] = [];
  for (let i = 0; i < count; i++) {
    const keypair = new Ed25519Keypair();

    const signer = new RawSigner(keypair, provider);
    const ex = keypair.export();

    const wallet = await signer.getAddress();
    const account: IMoveAccount = {
      publicKey: "0x" + wallet,
      privateKey: ex.privateKey,
      schema: ex.schema,
    };
    generatedAccounts.push(account);
  }

  fs.writeFile(PATH, JSON.stringify(generatedAccounts), (err) => {
    if (err) return console.error(err);
    console.log("Saved!");
  });
  return generatedAccounts;
}

async function mainWalletSigner(provider) {
  const keypair_ed25519 = Ed25519Keypair.deriveKeypair(
    MNOMIC,
    "m/44'/784'/0'/0'/0'"
  );
  const signer = new RawSigner(
    keypair_ed25519, // or use keypair_secp256k1 for ECDSA secp256k1
    new JsonRpcProvider("https://fullnode.testnet.sui.io/")
  );
  const address = await signer.getAddress();
  return signer;
}

// 0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::eden::Eden

// 0x2e09...a886
// 0x4c10b61966a34d3bb5c8a8f063e6b7445fc41f93::capy::CapyRegistry

// Я підключаюсь на свій основний кошельок
// Створюю 20 різних рандомних кошельків
// Поповнюю кожен з них на яку суму

// КУПИТИ НФТ
// ВИСТАВИТИ НФТ НА ПРОДАЖ

// НОВИЙ КОШЕЛЬОК І КАПЕЛЬКА ГРОШЕЙ

// АКАУНТ 1
// СТВОРЮЮ НОВЕ НФТ
// ВИСТАВЛЯЮ ЙОГО НА ПРОДАЖ ЗА Х грошей

// АКАУНТ 2
// СТВОРЮ НФТ
// КУПЛЮ В АКАУНТА 1 його НФТ

// await signAndExecuteTransaction({
//   kind: "moveCall",
//   data: {
//     packageObjectId: "0x2",
//     module: "devnet_nft",
//     function: "mint",
//     typeArguments: [],
//     arguments: [
//       "name",
//       "capy",
//       "https://cdn.britannica.com/94/194294-138-B2CF7780/overview-capybara.jpg?w=800&h=450&c=crop",
//     ],
//     gasBudget: 10000,
//   },
// });
