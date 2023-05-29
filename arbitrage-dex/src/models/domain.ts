import { DexChainData } from "../graph/jobs/DexChainData";
import { toPairId } from "../utils/utils";
import { GraphDataId, GraphPoolId } from "./GraphId";
import { GraphPoolData } from "./GraphPool";

export function createGraphData(result: any): DexChainData[] {
  return Object.keys(result).map((key) => {
    const id: GraphDataId = GraphPoolId.Create(key);

    // const item:GraphPool = {
    //   id:id,
    //   pairId: toPairId()

    //   poolId: element.id,
    //   token0Price: element.token0Price,
    //   token1Price: element.token1Price,
    //   pair: `${element.token0.symbol}/${element.token1.symbol}`,
    //   fee: element.feeTier ? parseFloat(element.feeTier) / 10000 : 0,
    //   dexName: exchange,
    //   totalVolumeUSD: element.volumeUSD,
    //   poolDayData: element.poolDayData,
    // }
    const data: any[] = result[key];

    const now = Date.now();
    data.map((d) => {
      d.id = id;
      d.pairId = toPairId(d);
      d.fee = d.feeTier ? parseFloat(d.feeTier) / 10000 : 0;
      d.pair = `${d.token0.symbol}/${d.token1.symbol}`;
      d.syncDate = d.syncAtTimestamp || now;
      delete d.feeTier;
    });
    return { graphDataId: id, data };
  });
}
