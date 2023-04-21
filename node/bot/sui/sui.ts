import { JsonRpcProvider, RawSigner } from "@mysten/sui.js";
import BigNumber from "bignumber.js";
import { Fs } from "../../utils/fs.module";
import { SuiAccount } from "./SuiAccount";
import { Sui } from "./sui.module";

const SUI_ADMIN_MNEMONIC = process.env.SUI_ADMIN_MNEMONIC || "";
const SUI_MAINNET_RPC_NODE = process.env.SUI_MAINNET_RPC_NODE || "";
const FRENEMIES_PACKAGE = "0x436dfcc34d299f3ad41a3429da4b66f2e627db84";
const PATH = "accounts.json";

const PERCENTS_OF_BALANCE_TO_STAKE = 0.8;
const ROLE = {
  0: "Friend",
  1: "Neutral",
  2: "Enemy",
};

let _validators: any[] = [];
export async function init() {
  const provider = new JsonRpcProvider(SUI_MAINNET_RPC_NODE, {
    faucetURL: "",
  });

  const accounts = await getPlayers(provider, 2);

  const { signer, address } = await Sui.Crypto.suiSigner(
    provider,
    SUI_ADMIN_MNEMONIC
  );
  const adminCoins = await provider.getCoins(address);
  const validators: any[] = await provider.getValidators();
  validators.sort((a, b) => {
    let l = BigNumber(a.next_epoch_delegation);
    let r = BigNumber(b.next_epoch_delegation);
    if (l.isLessThan(r)) {
      return -1;
    }
    if (l.isGreaterThan(r)) {
      return 1;
    }
    return 0;
  });
  validators.reverse();
  _validators = validators;

  const tasks = accounts.slice(0, 1).map((monkey, index) => {
    return new Promise(async (resolve, reject) => {
      const res = await monkeyJob(
        provider,
        signer,
        monkey,
        adminCoins.data[index].coinObjectId,
        index,
        resolve,
        reject
      ).catch(reject);
      resolve(res);
    });
  });
  await Promise.all(tasks);
}

async function tryNewRound(
  provider: JsonRpcProvider,
  monkey: SuiAccount,
  prefix: string
) {
  const monkeyObjects = await provider.getObjectsOwnedByAddress(
    monkey.publicKey
  );
  const frenemyObject = monkeyObjects.filter((c) =>
    c.type.includes(FRENEMIES_PACKAGE)
  )[0];

  const isMonkeyEmpty =
    monkey.validator === "" && monkey.epoch === -1 && monkey.role === -1;
  const roleDetails = await provider.getObject(frenemyObject.objectId);

  const globalEpoch = roleDetails["details"]["data"].fields.epoch;

  const newEpochStarted = monkey?.epoch + 1 !== +globalEpoch || isMonkeyEmpty;

  if (!newEpochStarted) return false;
  console.log(`${prefix}: starting new round, monkey epoch:${monkey.epoch}`);
  const response = await Sui.Frenemies.startNewRound(
    provider,
    monkey,
    frenemyObject.objectId,
    FRENEMIES_PACKAGE
  ).catch((e) => {
    console.log(`${prefix}:startNewRound failed, ${e}`);
  });
  const newRoundStatus = Sui.Utils.getMoveCallStatus(response);
  await Sui.Utils.delay(1000);
  const roleDetailsFresh = await provider.getObject(frenemyObject.objectId);
  const liveMonkeyRole =
    roleDetailsFresh["details"]["data"].fields.assignment.fields;

  monkey.validator = liveMonkeyRole.validator;
  monkey.epoch = liveMonkeyRole.epoch;
  monkey.role = liveMonkeyRole.goal;

  console.log(
    `${prefix}: monkey new round started, monkey epoch:${
      monkey.epoch
    } validator:${monkey.validator.substring(0, 5)}`
  );
  return true;
}
async function trySignUp(
  provider: JsonRpcProvider,
  monkey: SuiAccount,
  signer: RawSigner,
  prefix: string,
  coinObjectId,
  onError
) {
  if (monkey.funded && monkey.registered) return false;
  if (!monkey.funded) {
    const fundResponse = await Sui.Utils.retryMy(
      Sui.Utils.fund(signer, monkey.publicKey, "0.2", coinObjectId),
      3,
      "funding"
    ).catch((error) => {
      console.log(`${prefix}:funding with retries failed`);
      return onError({ error: error, operation: "funding" });
    });

    const fundStatus = Sui.Utils.getMoveCallStatus(fundResponse);
    console.log(`${prefix}: funding ${fundStatus}`);
    monkey.funded = true;
  }

  if (!monkey.registered) {
    const nickname = Sui.Accounts.generateNick() + monkey.publicKey.charAt(5);

    const setNameResponse = await Sui.Utils.retryMy(
      Sui.Frenemies.setName(provider, monkey, FRENEMIES_PACKAGE, nickname),
      3,
      "setName"
    ).catch((error) => {
      return onError({ error: error, operation: "setName" });
    });
    const fundStatus = Sui.Utils.getMoveCallStatus(setNameResponse);
    console.log(`${prefix}: setName ${fundStatus}`);
    monkey.registered = true;
  }
  return true;
}

async function monkeyJob(
  provider: JsonRpcProvider,
  signer: RawSigner,
  monkey: SuiAccount,
  adminCoinObjectId: string,
  index: number,
  onSuccess: any,
  onFailed: any
) {
  try {
    const prefix = `Monkey #${index} ${monkey.publicKey.substring(0, 6)}`;
    await Sui.Utils.delay(25000 * index);
    console.log(`${prefix}: started`);

    const monkeyMutated = await trySignUp(
      provider,
      monkey,
      signer,
      prefix,
      adminCoinObjectId,
      (error) => {
        console.log(error.operation, "error out");
        onFailed(error);
      }
    );

    const newRoundStarted = await tryNewRound(provider, monkey, prefix);

    if (newRoundStarted && monkeyMutated) {
      await Fs.updateAsync(PATH, monkey.publicKey, {
        ...monkey,
      });
      console.log(`${prefix}: changed applying to file`);
    }

    const monkeyStakePositions = await Sui.Frenemies.getStakePositions(
      provider,
      monkey.publicKey
    );

    if (newRoundStarted && monkeyStakePositions.length > 0) {
      console.log(
        `${prefix}: have ${monkeyStakePositions.length} stakes, dropping them`
      );
      const res = await Sui.Frenemies.unstakeAll(provider, monkey);
      const statuses = res.map(Sui.Utils.getMoveCallStatus);
      console.log(`${prefix}: unstake ${statuses}`);
    }

    if (monkeyStakePositions.length === 0) {
      const validatorAddress = Sui.Frenemies.stakeAddress(monkey, _validators);
      if (!validatorAddress)
        return onSuccess({
          data: {
            prefix: prefix,
            validatorAddress: validatorAddress,
          },
          error: null,
        });

      const monkeyBalance = await provider.getBalance(monkey.publicKey);
      const coinsToStake =
        await provider.selectCoinSetWithCombinedBalanceGreaterThanOrEqual(
          monkey.publicKey,
          BigInt(
            (
              monkeyBalance.totalBalance * PERCENTS_OF_BALANCE_TO_STAKE
            ).toFixed()
          )
        );

      // await Sui.Utils.mergeAll(provider, monkey, (error) => {
      //   console.log(error.data);
      // });
      const stakeResponse = await Sui.Frenemies.stakeAll2(
        provider,
        monkey,
        validatorAddress,
        coinsToStake,
        (error) => {
          console.log(error.data);
        }
      );
      const stakeStatus = Sui.Utils.getMoveCallStatus(stakeResponse.data);
      console.log(
        `${prefix}: stake to pool ${validatorAddress.substring(
          0,
          5
        )} ${stakeStatus}`
      );
    }
    console.log(`${prefix}: completed`);
  } catch (e) {
    onFailed(e);
  }
}

async function getPlayers(provider: JsonRpcProvider, count: number = 2) {
  let isWalletsGenerated = await Fs.isFileExistsAsync(PATH);
  let accounts: SuiAccount[] = [];
  if (isWalletsGenerated) {
    accounts = await Fs.loadFileAsync<SuiAccount[]>(PATH);
  } else {
    accounts = await Sui.Accounts.generateAccounts(provider, count, PATH);
  }
  return accounts;
}
