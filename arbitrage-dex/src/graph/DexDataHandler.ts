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
interface UniswapFamilyDexGraphData {
  v2: Pair[];
  v3: Pair[];
}

@singleton()
export class DexDataHandler {
  protected uniquePairs: string[] = [];
  public pairsToPools = new Map<string, PoolInfo[]>();

  private _storage: DexPairsRepository;
  private _db = new Map<string, Map<string, PoolInfo[]>>();

  constructor(repository: DexPairsRepository) {
    this._storage = repository;
  }
  public async handle(exchangeName: string, data: UniswapFamilyDexGraphData) {
    if ("v2" in data && "v3" in data) {
      const v2Distincted = distinctKey<Pair>(data.v2, "id");
      const v3Distincted = distinctKey<Pair>(data.v3, "id");
      const datav2 = toDictinary(v2Distincted, exchangeName + "v2");
      const datav3 = toDictinary(v3Distincted, exchangeName + "v3");
      const allPairsV2: string[] = getPairIds(v2Distincted);
      const allPairsV3: string[] = getPairIds(v3Distincted);
      //TODO: For now only t0_t1, but maybe need also check t1_t0 ?

      this.uniquePairs = distinct(allPairsV2, allPairsV3, this.uniquePairs);

      this._db.set(exchangeName + "v2", datav2);
      this._db.set(exchangeName + "v3", datav3);
    }

    console.log(
      "new data handled",
      "exchange:",
      exchangeName,
      "v2",
      data.v2.length,
      "v3",
      data.v3.length,
      "uniquePairs",
      this.uniquePairs.length
    );
    const entries = Array.from(this._db.entries());
    this.pairsToPools = pairToPools(entries, this.uniquePairs);
    debugger;
    this._storage.init(this.pairsToPools);

    const e = await Fs.writeAsync(
      "./pairsToPools.json",
      Array.from(this.pairsToPools.entries())
    );
  }
}
