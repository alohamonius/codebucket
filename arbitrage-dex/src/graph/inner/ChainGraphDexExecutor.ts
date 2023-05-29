import { getBuiltGraphSDK as ethSdk } from "../clients/eth_rc/.graphclient";
import {
  GetPoolsByIdsBscQueryVariables,
  getBuiltGraphSDK as bscSdk,
} from "../clients/bsc_rc/.graphclient";
import { getBuiltGraphSDK as maticSdk } from "../clients/matic_rc/.graphclient";
import { Chain, ChainType, GraphPairId } from "../../models/GraphId";
import { globalFilter } from "./DexesConfig";
import { AppLogger } from "../../utils/App.logger";

export interface GraphApiResponse {
  data: any[];
  error: any;
}
export class ChainGraphDexExecutor {
  chainToApi = new Map<Chain, any>();

  constructor() {
    this.chainToApi.set(Chain.eth, {
      id: (filter) => ethSdk().GetPoolsByIdsEth(filter),
      all: (filter) => ethSdk().GetPoolsEth(filter),
    });

    this.chainToApi.set(Chain.bsc, {
      id: (filter) => bscSdk().GetPoolsByIdsBsc(filter),
      all: (filter) => bscSdk().GetPoolsBsc(filter),
    });

    this.chainToApi.set(Chain.matic, {
      id: (filter) => maticSdk().GetPoolsByIdsMatic(filter),
      all: (filter) => maticSdk().GetPoolsMatic(filter),
    });
  }

  public getChains(): Chain[] {
    return [Chain.bsc, Chain.eth, Chain.matic];
  }

  public getByIds(
    chain: Chain,
    pairIds: GraphPairId[]
  ): Promise<GraphApiResponse> {
    const api = this.chainToApi.get(chain);

    return this.apiCall(chain, () =>
      api.id({
        totalLocked: globalFilter.totalLocked,
        tokenIn: pairIds.map((c) => c.left),
        tokenOut: pairIds.map((c) => c.right),
      })
    );
  }

  public getChainData(chain: Chain): Promise<GraphApiResponse> {
    const api = this.chainToApi.get(chain);

    return this.apiCall(chain, () =>
      api.all({
        first: 22222,
        totalLocked: 1000000,
      })
    );
  }

  public getAll(): Promise<any[]> {
    const chains = Array.from(this.chainToApi.keys());
    const chainTasks = chains.map((chain) => {
      return this.getChainData(chain).catch((e) => this.errorHandler(e, chain));
    });
    return Promise.all(chainTasks);
  }

  private async apiCall(
    chain: Chain,
    apiMethod: () => Promise<any[]>
  ): Promise<GraphApiResponse> {
    try {
      const response = await apiMethod();
      return {
        data: response,
        error: null,
      };
    } catch (error) {
       return {
        data: null,
        error: this.errorHandler(error, chain),
      };
    }
  }

  private errorHandler(error, chain: Chain) {
    AppLogger.error(`${chain || null} ${JSON.stringify(error)}`);
    return {
      data: [],
      error: `${chain} ${JSON.stringify(error)}`,
    };
  }
}
