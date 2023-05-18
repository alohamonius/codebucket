export interface DexPairs {
  from: string;
  to: string;
  pairs: string[];
}
export interface PairToPools {
  pair: string;
  pools: PoolInfo[];
}
export interface PoolInfo {
  poolId: string;
  token0Price: string;
  token1Price: string;
  pair: string;
  fee: number;
  dexName: string;
  totalVolumeUSD: string;
  poolDayData: any[];
}
export interface Token {
  id: string;
  symbol: string;
  name: string;
  decimals: string;
}

export interface Pair {
  id: string;
  token0: Token;
  token0Price: string;
  token1: Token;
  token1Price: string;
  poolDayData: [];
  volumeUSD: string;
}
