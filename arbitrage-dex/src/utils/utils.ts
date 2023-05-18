import { Pair, PoolInfo } from "../graph/types";

export function pairToPools(
  objects: [string, Map<string, PoolInfo[]>][],
  uniquePairs: string[]
): Map<string, PoolInfo[]> {
  let pairToPools: Map<string, PoolInfo[]> = new Map<string, PoolInfo[]>();
  for (let i = 0; i < uniquePairs.length; i++) {
    const pair = uniquePairs[i];
    for (let j = 0; j < objects.length; j++) {
      const dexName = objects[j][0];
      const currentDexMap = objects[j][1];

      if (currentDexMap.has(pair)) {
        const pairData = currentDexMap.get(pair);
        if (pairToPools.has(pair)) {
          const poolData = pairToPools.get(pair);
          pairToPools.set(pair, poolData.concat(pairData));
        } else {
          pairToPools.set(pair, pairData);
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
      pair: element.token0.symbol + "/" + element.token1.symbol,
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
  return (element.token0.id + "_" + element.token1.id).toLowerCase();
}

export function distinct(...arrays): any[] {
  const combinedArray = [].concat(...arrays);
  return [...new Set(combinedArray)];
}

export function getPairIds(pairs: Pair[]): string[] {
  return pairs.map((d) => d.token0.id + "_" + d.token1.id);
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
