import { singleton } from "tsyringe";
import { distinctKey, getPairIds, toDictinary } from "../utils/utils";
import { DexPairsRepositoryMemory } from "./DexPairsRepositoryMemory";
import { AppLogger } from "../utils/App.logger";
import { DexChainData } from "./jobs/DexChainData";
import { ChainType, GraphId, GraphPoolId, PairId } from "../models/GraphId";
import { GraphPoolData } from "../models/GraphPool";

@singleton()
export class DexDataHandler {
  private _storage: DexPairsRepositoryMemory;
  private _db = new Map<GraphId, Map<PairId, GraphPoolData[]>>();

  constructor(repository: DexPairsRepositoryMemory) {
    AppLogger.info("DexDataHandler ctor");
    this._storage = repository;
  }
  public async handle(graphData: DexChainData[]) {
    graphData.forEach((data) => {
      const id = data.graphDataId.id();
      const pools = distinctKey<GraphPoolData>(data.data, "pairId");

      const pairIds: PairId[] = pools.map((c) => c.pairId);

      this._storage.setChainPairs(data.graphDataId.chain, pairIds);
      const dexСhainVData = toDictinary(pools);

      AppLogger.info(`${id} has pairs:${pairIds.length}`);

      this._db.set(id, dexСhainVData);
    });

    this._storage.setChainPairPools(Array.from(this._db.entries()));
  }
}
