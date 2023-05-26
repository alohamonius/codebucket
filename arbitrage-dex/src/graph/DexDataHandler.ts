import { singleton } from "tsyringe";
import {
  distinct,
  distinctKey,
  getPairIds,
  pairToPools,
  toDictinary,
} from "../utils/utils";
import { Pair, PoolInfo } from "./types";
import { Fs } from "../utils/fs.module";
import { DexPairsRepository } from "./DexPairsRepository";
import { AppLogger } from "../utils/App.logger";
import { DexChainData } from "./jobs/DexChainData";
interface UniswapFamilyDexGraphData {
  matic_v3?: Pair[] | undefined;
  bsc_v3?: Pair[] | undefined;
  eth_v2?: Pair[] | undefined;
  eth_v3?: Pair[] | undefined;
  bsc_v2?: Pair[] | undefined;
}

@singleton()
export class DexDataHandler {
  private uniquePairs: string[] = [];

  private _storage: DexPairsRepository;
  private _db = new Map<string, Map<string, PoolInfo[]>>();

  constructor(repository: DexPairsRepository) {
    AppLogger.info("DexDataHandler ctor");
    this._storage = repository;
    this.uniquePairs = [];
  }
  public async handle(dexChainDatas: DexChainData[]) {
    dexChainDatas.forEach((dexChainData) => {
      AppLogger.info(
        `${dexChainData.dexName}/${dexChainData.version}/${dexChainData.chain}/${dexChainData.data.length}`
      );
      const uniquePairs = distinctKey<Pair>(dexChainData.data, "id");
      const pairIds: string[] = getPairIds(uniquePairs);

      const dexKey = `${dexChainData.dexName}_${dexChainData.version}_${dexChainData.chain}`;
      const dexData = toDictinary(uniquePairs, dexKey);
      this.uniquePairs = distinct(pairIds, this.uniquePairs);

      this._db.set(dexKey, dexData);
    });

    this._storage.init(
      pairToPools(Array.from(this._db.entries()), this.uniquePairs)
    );
  }
}
