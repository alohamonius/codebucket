import { RawSigner, Ed25519Keypair, JsonRpcProvider } from "@mysten/sui.js";
import { fromB64 } from "@mysten/bcs";
import { SuiAccount } from "./SuiAccount";
import { ethers, Wallet } from "ethers";
import { Fs } from "../../utils/fs.module";
//maybe not only SUI, APTOS also (MoveModule)
// var generator = require("mnemonic-generator");

export namespace Sui {
  export namespace Crypto {
    export function revertKeypairFromSecret(privateKey: string) {
      return Ed25519Keypair.fromSecretKey(fromB64(privateKey));
    }

    export function makeSigner(
      provider: JsonRpcProvider,
      account: SuiAccount
    ): RawSigner {
      const keypair = revertKeypairFromSecret(account.privateKey);
      const signer = new RawSigner(keypair, provider);
      return signer;
    }

    export function makeSigners(
      provider: JsonRpcProvider,
      accounts: SuiAccount[]
    ): RawSigner[] {
      return accounts.map((account) => makeSigner(provider, account));
    }

    async function signerByMnemonic(MNEMONIC, provider) {
      const keypair = Ed25519Keypair.deriveKeypair(
        MNEMONIC,
        "m/44'/784'/0'/0'/0'"
      );
      const signer = new RawSigner(keypair, provider);
      return signer;
    }
    export async function suiSigner(provider, MNEMONIC) {
      const signer = await signerByMnemonic(MNEMONIC, provider);
      const address = await signer.getAddress();
      return { address: address, signer: signer };
    }
  }

  export namespace Accounts {
    export function generateNick() {
      const pfefix = [
        "ilo",
        "ado",
        "ama",
        "fun",
        "adv",
        "harm",
        "dar",
        "ene",
        "nftt",
        "hila",
        "hile",
        "pand",
        "crryy",
      ];

      const sufix = [
        "ber",
        "fog",
        "ott",
        "wol",
        "tig",
        "lio",
        "pan",
        "gir",
        "ele",
        "kan",
        "cvo",
        "lop",
      ];

      const adjective = pfefix[Math.floor(Math.random() * pfefix.length)];
      const noun = sufix[Math.floor(Math.random() * sufix.length)];

      return adjective + noun;
    }

    export async function generateAccounts(
      provider,
      count,
      path
    ): Promise<SuiAccount[]> {
      let generatedAccounts: SuiAccount[] = [];
      for (let i = 0; i < count; i++) {
        const mnemonic = Wallet.createRandom().mnemonic;
        const keypair = Ed25519Keypair.deriveKeypair(
          mnemonic.phrase,
          "m/44'/784'/0'/0'/0'"
        );

        const signer = new RawSigner(keypair, provider);
        const ex = keypair.export();

        const wallet = await signer.getAddress();
        const account = SuiAccount.From(
          wallet,
          ex.privateKey,
          ex.schema,
          mnemonic.phrase,
          false,
          false,
          "",
          -1,
          -1
        );
        generatedAccounts.push(account);
      }

      await Fs.writeAsync(path, generatedAccounts);
      return generatedAccounts;
    }
  }

  export namespace Utils {
    export function delay(period) {
      return new Promise((res) => setTimeout(res, period));
    }
    export function retryMy(operation, attempt, messageKey = "error") {
      return new Promise((res, reject) => {
        return operation.then(res).catch((error) => {
          console.log(`${messageKey} retry #${attempt}`);
          if (attempt > 0 && !error.message.includes("No pools")) {
            return delay(2500 * attempt)
              .then(retryMy.bind(null, operation, --attempt, messageKey))
              .then(res)
              .catch((e) => {
                reject(e);
              });
          }

          return reject(error);
        });
      });
    }
    export function getMoveCallStatus(moveCallResponse) {
      const receipt = moveCallResponse["EffectsCert"];
      return receipt.effects.effects.status;
    }
    export function toSuiAmount(amount: string) {
      return +ethers.utils.parseUnits(amount, 9);
    }
    export function fromSui(amount: number) {
      return amount * 10e-10;
    }

    export function fund(signer, receiver, amount, coinObjectId) {
      return signer.paySui({
        inputCoins: [coinObjectId],
        recipients: [receiver],
        amounts: [toSuiAmount(amount)],
        gasBudget: 2000,
      });
    }

    export async function mergeAll(
      provider: JsonRpcProvider,
      account: SuiAccount,
      onFail
    ) {
      const coins = await provider.getAllCoins(account.publicKey);
      const mainCoin = coins.data[0].coinObjectId;
      const coinParts = coins.data.length;
      if (coinParts < 2) return Promise.resolve(true);

      const signer = Sui.Crypto.makeSigner(provider, account);
      const mergeTasks = coins.data.slice(1, 2).map((coin, index) => {
        return Sui.Utils.delay(10000 * index)
          .then((d) => {
            return Sui.Utils.retryMy(
              signer.mergeCoin({
                primaryCoin: mainCoin,
                coinToMerge: coin.coinObjectId,
                gasBudget: 500,
              }),
              1,
              "merge-all"
            );
          })
          .catch((e) => {
            onFail({
              data: { primaryCoin: mainCoin, toMerge: coin.coinObjectId },
              error: e,
            });
          });
      });
      return await Promise.all(mergeTasks);
    }
  }

  export namespace Frenemies {
    export async function getStakePositions(provider, publicKey) {
      const objects = await provider.getObjectsOwnedByAddress(publicKey);
      return objects.filter((c) => c.type === "0x2::staking_pool::StakedSui");
    }

    export function stakeAddress(account: SuiAccount, validators: any[]) {
      const index = validators.findIndex(
        (validator) =>
          validator.sui_address.toLowerCase() ===
          account.validator.toLowerCase()
      );

      if (account.role === 0) {
        return validators[index];
      }
      if (account.role === 1) {
        return null;
      }
      if (account.role === 2) {
        return index > 0
          ? validators[index - 1].sui_address
          : validators[1].sui_address;
      }
    }
    export async function startNewRound(
      provider: JsonRpcProvider,
      account: SuiAccount,
      objectId: string,
      frenemiesPackage: string
    ) {
      const acc2Signer = Sui.Crypto.makeSigner(provider, account);
      return await acc2Signer.executeMoveCall({
        packageObjectId: frenemiesPackage,
        module: "frenemies",
        function: "update",
        typeArguments: [],
        arguments: [
          objectId, //object type frenemies::Scorecard
          "0x5",
          "0x3b687296398b01a4054c44a552375fc988992c22",
        ],
        gasBudget: 20000,
      });
    }

    export async function stakeAll2(
      provider: JsonRpcProvider,
      account: SuiAccount,
      validatorAddress: string,
      coins: any[],
      onFail: any
    ) {
      const signer = Sui.Crypto.makeSigner(provider, account);

      const w = coins.map((c) => {
        return {
          id: c.details.data.fields.id.id,
          balance: c.details.data.fields.balance,
        };
      });

      const coindIds = w.map((c) => c.id);
      const balances = w.map((c) => c.balance);

      const tx = await Sui.Utils.retryMy(
        signer.executeMoveCall({
          packageObjectId: "0x2",
          module: "sui_system",
          function: "request_add_delegation_mul_coin",
          typeArguments: [],
          arguments: ["0x5", coindIds, balances, validatorAddress],
          gasBudget: 20000,
        }),
        1,
        "stake-all retry"
      ).catch((error) => {
        const errorData = {
          data: {
            account: account.publicKey,
            coindIds: coindIds,
            balances: balances,
          },
          error: error,
        };
        onFail(errorData);
        return Promise.resolve(errorData);
      });

      return {
        data: {
          account: account.publicKey,
          coindIds: coindIds,
          balances: balances,
          tx: tx,
        },
        error: null,
      };
    }

    export async function stakeAll(
      provider: JsonRpcProvider,
      account: SuiAccount,
      validatorAddress: string,
      onFail: any
    ) {
      const signer = Sui.Crypto.makeSigner(provider, account);
      const coins = await provider.getCoins(account.publicKey);

      const tasks = coins.data.map((coinPart, index) => {
        return Sui.Utils.delay(1000 * index)
          .then(async (d) => {
            const tx = await Sui.Utils.retryMy(
              signer.executeMoveCall({
                packageObjectId: "0x2",
                module: "sui_system",
                function: "request_add_delegation_mul_coin",
                typeArguments: [],
                arguments: [
                  "0x5",
                  [coinPart.coinObjectId],
                  ["" + coinPart.balance],
                  validatorAddress,
                ],
                gasBudget: 20000,
              }),
              1,
              "stake-all retry"
            );
            return {
              data: {
                coinObjectId: coinPart.coinObjectId,
                balance: coinPart.balance,
                tx: tx,
              },
              error: null,
            };
          })
          .catch((error) => {
            const errorData = {
              data: {
                coinObjectId: coinPart.coinObjectId,
                balance: coinPart.balance,
              },
              error: error,
            };
            onFail(errorData);
            return Promise.resolve(errorData);
          });
      });
      return await Promise.all(tasks);
    }

    export async function unstakeAll(
      provider: JsonRpcProvider,
      account: SuiAccount
    ) {
      const stakedObjects = await getStakePositions(
        provider,
        account.publicKey
      );

      const tasks = stakedObjects.map((stakePosition, index) => {
        return Sui.Utils.delay(1000 * index).then((d) => {
          return Sui.Utils.retryMy(
            unstake(provider, account, stakePosition.objectId),
            3,
            "unstake-all retry"
          );
        });
      });
      return await Promise.all(tasks);
    }

    export function unstake(
      provider: JsonRpcProvider,
      account: SuiAccount,
      stakeObjectId
    ) {
      const acc2Signer = Sui.Crypto.makeSigner(provider, account);
      return acc2Signer.executeMoveCall({
        packageObjectId: "0x2",
        module: "sui_system",
        function: "cancel_delegation_request",
        typeArguments: [],
        arguments: ["0x5", stakeObjectId],
        gasBudget: 20000,
      });
    }

    export async function stake(
      provider: JsonRpcProvider,
      account: SuiAccount,
      validatorAddress: string
    ) {
      const signer = Sui.Crypto.makeSigner(provider, account);
      const coins = await provider.getCoins(account.publicKey);

      return signer.executeMoveCall({
        packageObjectId: "0x2",
        module: "sui_system",
        function: "request_add_delegation_mul_coin",
        typeArguments: [],
        arguments: [
          "0x5",
          [coins.data[0].coinObjectId],
          ["" + coins.data[0].balance],
          validatorAddress,
        ],
        gasBudget: 20000,
      });
    }

    export function setName(
      provider,
      account: SuiAccount,
      frenemiesPackage,
      nick
    ) {
      const acc2Signer = Sui.Crypto.makeSigner(provider, account);

      return acc2Signer
        .executeMoveCall({
          packageObjectId: frenemiesPackage,
          module: "frenemies",
          function: "register",
          typeArguments: [],
          arguments: [
            nick,
            "0xef151701ff1f4424faa36aba95c21efdd8d89bf9", //??
            "0xc42531c558ded8fcfecb0b0a4b479d9efb14af67", //??
            "0x5", //?? +-
          ],
          gasBudget: 20000,
        })
        .catch((err) => {
          if (err.message.includes("amount sufficient")) {
            console.log(
              `${account.publicKey.substring(0, 5)} no money for register`
            );
          }
          console.log(err.message);
          return false;
        });
    }
  }
}
export namespace SuiCryptoModule {}
