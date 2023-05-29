import { injectable, singleton } from "tsyringe";
import { AppLogger } from "../utils/App.logger";
import { graphToPairIdPools, distinct } from "../utils/utils";
import {
  Chain,
  ChainType,
  GraphId,
  GraphPoolId,
  PairId,
} from "../models/GraphId";
import { GraphPoolData } from "../models/GraphPool";

@singleton()
// @injectable()
export class DexPairsRepositoryMemory {
  private pairsToPools = new Map<PairId, GraphPoolData[]>();
  private chainPairs = new Map<Chain, PairId[]>();
  private chainPairPools = new Map<Chain, [PairId, GraphPoolData[]][]>();

  constructor() {
    AppLogger.info("DexPairsRepository ctor");
  }

  public getPairIds(pairIds: PairId[]): Map<string, GraphPoolData[]> {
    const result = new Map<string, GraphPoolData[]>();

    for (const pairId of pairIds) {
      if (this.pairsToPools.has(pairId)) {
        const poolInfoArray = this.pairsToPools.get(pairId);
        result.set(pairId, poolInfoArray);
      }
    }

    return result;
  }

  public getStats() {
    const totalPairs = Array.from(this.chainPairs.values()).reduce(
      (x, c) => x + c.length,
      0
    );
    const chains = Array.from(this.chainPairs.keys());
    const chainPerPairs = chains.map((chain) => {
      const chainPairs = this.chainPairs.get(chain);
      return { pairsCount: chainPairs.length, chain: chain };
    });
    return { totalPairs, chainPerPairs };
  }

  public getPairs(chain: Chain): PairId[] {
    return this.chainPairs.get(chain);
  }

  public setChainPairs(chain: Chain, pairIds: PairId[]) {
    const chainPairs = this.chainPairs.get(chain);
    const newChainPairs = chainPairs ? distinct(chainPairs, pairIds) : pairIds;
    const newPairsHandled =
      !chainPairs || newChainPairs.length !== chainPairs.length;
    if (newPairsHandled) {
      this.chainPairs.set(chain, newChainPairs);
    }
  }

  public setChainPairPools(data: [GraphId, Map<PairId, GraphPoolData[]>][]) {
    const chainPairPools = graphToPairIdPools(data, this.chainPairs);
    this.chainPairPools = chainPairPools;
  }
}
