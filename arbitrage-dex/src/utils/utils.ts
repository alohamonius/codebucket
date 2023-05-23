import { Pair, PoolInfo } from "../graph/types";
import { AppLogger } from "./App.logger";

export function pairToPools(
  objects: [string, Map<string, PoolInfo[]>][],
  uniquePairs: string[]
): Map<string, PoolInfo[]> {
  let pairToPools: Map<string, PoolInfo[]> = new Map<string, PoolInfo[]>();
  for (let i = 0; i < uniquePairs.length; i++) {
    const pairId = uniquePairs[i];

    for (let j = 0; j < objects.length; j++) {
      const dexName = objects[j][0];
      const currentDexMap = objects[j][1];

      if (currentDexMap.has(pairId)) {
        const pairData = currentDexMap.get(pairId);
        if (pairToPools.has(pairId)) {
          const poolData = pairToPools.get(pairId);
          pairToPools.set(pairId, distinct(poolData.concat(pairData)));
        } else {
          pairToPools.set(pairId, pairData);
        }
      }
    }
  }
  return pairToPools;
}

export function toDictinary(
  data: any[],
  exchange: string
): Map<string, PoolInfo[]> {
  const test = new Map<string, PoolInfo[]>();

  data.forEach((element) => {
    const key = toKey(element);
    const poolInfo: PoolInfo = {
      poolId: element.id,
      token0Price: element.token0Price,
      token1Price: element.token1Price,
      pair: `${element.token0.symbol}/${element.token1.symbol}`,
      fee: element.feeTier ? parseFloat(element.feeTier) / 10000 : 0,
      dexName: exchange,
      totalVolumeUSD: element.volumeUSD,
      poolDayData: element.poolDayData,
    };
    test.has(key) ? test.get(key).push(poolInfo) : test.set(key, [poolInfo]);
  });
  return test;
}

function toKey(element: Pair) {
  return `${element.token0.id}_${element.token1.id}`;
}
const bytesToMb = (bytes) => Math.round((bytes / 1024 / 1024) * 100) / 100;
export function logMemory() {
  const used = process.memoryUsage();
  const row = {
    rss: bytesToMb(used.rss),
    heapTotal: bytesToMb(used.heapTotal),
    heapUsed: bytesToMb(used.heapUsed),
    external: bytesToMb(used.external),
    stack: bytesToMb(used.rss - used.heapTotal),
  };
  AppLogger.info(row);
  // console.table(row);
  // for (let key in used) {
  //   AppLogger.info(`Memory: ${key} ${bytesToMb(used[key])} MB`);
  // }
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

export function getPairIds(pairs: Pair[]): string[] {
  return pairs.map(toKey);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
