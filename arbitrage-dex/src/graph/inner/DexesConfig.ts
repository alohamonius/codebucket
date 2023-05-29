import { DocumentNode } from "graphql";
import {
  GetPoolsSushiDocument,
  GetPoolsSushiLiveDocument,
  subscribe as sushi,
  getBuiltGraphSDK as sushiSdk,
} from "../../graph/clients/sushi_rc/.graphclient";
import {
  GetPoolsUniswapDocument,
  GetPoolsUniswapLiveDocument,
  subscribe as uniswap,
  getBuiltGraphSDK as uniswapSdk,
} from "../../graph/clients/uniswap_rc/.graphclient";
import { singleton } from "tsyringe";
import { AppLogger } from "../../utils/App.logger";
import {
  GetPoolsPancakeDocument,
  GetPoolsPancakeLiveDocument,
  subscribe as pancakeSubscribe,
  getBuiltGraphSDK as pancakeSdk,
} from "../../graph/clients/pancake_rc/.graphclient";

export const globalFilter: any = {
  first: 30000,
  skip: 0,
  totalLocked: 20000,
  tokenIn: [],
  tokenOut: [],
};

// @singleton()
// export default class DexesConfig {
//   public DEX_TO_DOCS: IConfig[] = [];

//   constructor() {
//     this.DEX_TO_DOCS.push({
//       liveDoc: GetPoolsPancakeLiveDocument,
//       doc: GetPoolsPancakeDocument,
//       name: "pancake",
//       subscribe: pancakeSubscribe,
//       execute: () => pancakeSdk().GetPoolsPancake(globalFilter),
//       filter: globalFilter,
//     });

//     this.DEX_TO_DOCS.push({
//       liveDoc: GetPoolsSushiLiveDocument,
//       doc: GetPoolsSushiDocument,
//       name: "sushi",
//       subscribe: sushi,
//       execute: () => sushiSdk().GetPoolsSushi(globalFilter),
//       filter: globalFilter,
//     });

//     this.DEX_TO_DOCS.push({
//       liveDoc: GetPoolsUniswapLiveDocument,
//       doc: GetPoolsUniswapDocument,
//       name: "uniswap",
//       subscribe: uniswap,
//       execute: () => uniswapSdk().GetPoolsUniswap(globalFilter),
//       filter: globalFilter,
//     });
//     AppLogger.info(`DEXES_CONFIG_CREATED`);
//   }
// }
// export interface IConfig {
//   liveDoc: DocumentNode;
//   doc: DocumentNode;
//   name: string;
//   subscribe: any;
//   filter: any;
//   execute: any;
// }
