import { singleton } from "tsyringe";
import {
  distinct,
  distinctKey,
  getPairIds,
  logMemory,
  pairToPools,
  toDictinary,
} from "../utils/utils";
import { Pair, PoolInfo } from "./types";
import { Fs } from "../utils/fs.module";
import { DexPairsRepository } from "./DexPairsRepository";
import { AppLogger } from "../utils/App.logger";
interface UniswapFamilyDexGraphData {
  v2: Pair[];
  v3: Pair[];
}

@singleton()
export class DexDataHandler {
  protected uniquePairs: string[] = [];

  private _storage: DexPairsRepository;
  private _db = new Map<string, Map<string, PoolInfo[]>>();

  constructor(repository: DexPairsRepository) {
    AppLogger.info("DexDataHandler ctor");
    this._storage = repository;
  }
  public async handle(exchangeName: string, data: UniswapFamilyDexGraphData) {
    // if ("v2" in data && "v3" in data) {
    //   const v2Distincted = distinctKey<Pair>(data.v2, "id");
    //   const v3Distincted = distinctKey<Pair>(data.v3, "id");
    //   const datav2 = toDictinary(v2Distincted, exchangeName + "v2");
    //   const datav3 = toDictinary(v3Distincted, exchangeName + "v3");
    //   const allPairsV2: string[] = getPairIds(v2Distincted);
    //   const allPairsV3: string[] = getPairIds(v3Distincted);
    //   //TODO: For now only t0_t1, but maybe need also check t1_t0 ?
    //   //TODO: Need to check current data and new, 1. how many new pairs?

    //   this.uniquePairs = distinct(allPairsV2, allPairsV3, this.uniquePairs);

    //   // this._db.set(exchangeName + "v2", datav2);
    //   // this._db.set(exchangeName + "v3", datav3);
    // }

    logMemory();

    // AppLogger.info(
    //   `${exchangeName} v2:${data.v2?.length || 0} v3:${
    //     data.v3?.length || 0
    //   }, uniquePairs:${this.uniquePairs.length}`
    // );

    // this._storage.init(
    //   pairToPools(Array.from(this._db.entries()), this.uniquePairs)
    // );
  }
}
