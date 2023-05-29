import {
  Chain,
  GraphId,
  GraphPoolId,
  GraphPairId,
  PairId,
} from "../models/GraphId";
import { GraphPoolData } from "../models/GraphPool";

export function graphToPairIdPools(
  graphDexDatas: [GraphId, Map<PairId, GraphPoolData[]>][],
  uniquePairs: Map<Chain, PairId[]>
): Map<Chain, [PairId, GraphPoolData[]][]> {
  let chainTo = new Map<Chain, [PairId, GraphPoolData[]][]>();
  const chains = Array.from(uniquePairs.keys());

  const graphId =
    graphDexDatas[0].length > 0
      ? GraphPoolId.Create(graphDexDatas[0][0])
      : null;

  if (!graphId) {
    return;
  }

  chains.forEach((chain) => {
    let pairToPools = new Map<PairId, GraphPoolData[]>();
    uniquePairs.get(chain).forEach((pairId: PairId) => {
      for (let j = 0; j < graphDexDatas.length; j++) {
        const dexPools = graphDexDatas[j][1];

        if (dexPools.has(pairId)) {
          const pairData = dexPools.get(pairId);
          if (pairToPools.has(pairId)) {
            const poolData = pairToPools.get(pairId);
            pairToPools.set(pairId, distinct(poolData.concat(pairData)));
          } else {
            pairToPools.set(pairId, pairData);
          }
        }
      }
      const pairIdToPools = Array.from(pairToPools.entries());
      chainTo.set(chain, pairIdToPools);
    });
  });
  return chainTo;
}

export function toDictinary(
  pools: GraphPoolData[]
): Map<PairId, GraphPoolData[]> {
  const pairIdToPools = new Map<PairId, GraphPoolData[]>();

  pools.forEach((element) => {
    const graphPair = GraphPairId.From(element);
    const id = graphPair.id();
    pairIdToPools.has(id)
      ? pairIdToPools.get(id).push(element)
      : pairIdToPools.set(id, [element]);
  });
  return pairIdToPools;
}

const bytesToMb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;
export function getMemoryUsage() {
  const used = process.memoryUsage();
  const row = {
    rss: bytesToMb(used.rss),
    heapTotal: bytesToMb(used.heapTotal),
    heapUsed: bytesToMb(used.heapUsed),
    external: bytesToMb(used.external),
    stack: bytesToMb(used.rss - used.heapTotal),
  };
  return row;
}

export function distinct(...arrays): any[] {
  const combinedArray = [].concat(...arrays);
  return [...new Set(combinedArray)];
}

export function distinctKey<T>(array: T[], key: keyof T): T[] {
  const map = new Map<T[keyof T], T>();
  for (const item of array) {
    map.set(item[key], item);
  }
  return Array.from(map.values());
}

export function toPairId(element: any): PairId {
  return `${element.token0.id}_${element.token1.id}`;
}

export function getPairIds(pools: GraphPoolData[]): PairId[] {
  return pools.map((p) => p.pairId);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
