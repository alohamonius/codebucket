import { GraphPoolData } from "./GraphPool";

export interface GraphDataId {
  dexName: string;
  chain: Chain;
  version: string; //number
  id(): GraphId;
}
export type GraphId = string; //dex_2_eth
export type PairId = string; //t0_t1

export class GraphPairId {
  left: string;
  right: string;

  constructor(left: string, right: string) {
    this.left = left;
    this.right = right;
  }

  public id = () => `${this.left}_${this.right}`;

  public static From(pool: GraphPoolData): GraphPairId {
    const regex = /^[\d]+_[\d]+$/;
    const valid = "token0" in pool && "token1" in pool;
    if (!valid) throw new Error("Invalid PairId");
    const pairId = new GraphPairId(pool.token0.id, pool.token1.id);
    return pairId;
  }
}
export class GraphPoolId implements GraphDataId {
  dexName: string;
  version: string;
  chain: Chain;
  constructor(dexName_: string, chain_: Chain | string, version_: string) {
    this.dexName = dexName_;
    this.chain = typeof chain_ === "string" ? Chain[chain_] : chain_;
    this.version = version_;
  }

  public id(): GraphId {
    return `${this.dexName}_${this.chain}_${this.version}`;
  }

  static Create(key: string) {
    const fields = key.split("_");
    const dexName = fields[0];

    const chain = fields[1];
    const version = fields[2];
    return new GraphPoolId(dexName, chain, version);
  }
}

export type ChainType = Chain | string;
export enum Chain {
  bsc = "bsc",
  eth = "eth",
  matic = "matic",
}
