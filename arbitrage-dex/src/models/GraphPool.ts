import { GraphPoolId, PairId } from "./GraphId";
import { Token } from "./Token";

// type D = Map<string, [PoolId, GraphPoolData[]][]>;

export type GraphPoolType = GraphPoolData;

export interface GraphPoolData {
  id: GraphPoolId; // sushi_3_eth
  dexPoolId: string; // 0xasdada
  pairId: PairId; // token0_token1
  pair: string;

  token0: Token;
  token1: Token;

  fee: number;

  token0Price: string;
  token1Price: string;
  poolDayData: [];
  totalVolumeUSD: string;

  reserve0: string;
  reserve1: string;
  syncDate: string;
}

export interface GraphPoolApi {
  poolId: string;
  token0Price: string;
  token1Price: string;
  pair: string;
  fee: number;
  dexName: string;
  totalVolumeUSD: string;
  poolDayData: any[];
  reserve0: string;
  reserve1: string;
  syncDate: string;
}
