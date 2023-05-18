import { injectable, singleton } from "tsyringe";
import { PoolInfo } from "./types";

@singleton()
// @injectable()
export class DexPairsRepository {
  public pairsToPools = new Map<string, PoolInfo[]>();

  public get(pairIds: string[]): Map<string, PoolInfo[]> {
    const result = new Map<string, PoolInfo[]>();

    for (const pairId of pairIds) {
      if (this.pairsToPools.has(pairId)) {
        const poolInfoArray = this.pairsToPools.get(pairId);
        result.set(pairId, poolInfoArray);
      }
    }

    return result;
  }

  public init(data: Map<string, PoolInfo[]>) {
    this.pairsToPools = data;
  }
}
