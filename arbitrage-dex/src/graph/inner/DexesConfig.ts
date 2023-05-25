import { DocumentNode } from "graphql";
import {
  GetPoolsSushiDocument,
  GetPoolsSushiLiveDocument,
  subscribe as sushi,
  execute as sushiExecute,
} from "../../graph/clients/sushi_rc/.graphclient";
import {
  GetPoolsUniswapDocument,
  GetPoolsUniswapLiveDocument,
  subscribe as uniswap,
  execute as uniswapExecute,
} from "../../graph/clients/uniswap_rc/.graphclient";
import { singleton } from "tsyringe";
import { AppLogger } from "../../utils/App.logger";

@singleton()
export default class DexesConfig {
  public DEX_TO_DOCS: IConfig[] = [];

  filter = {
    first: 30000,
    skip: 0,
    totalLocked: 5000,
  };

  constructor() {
    this.DEX_TO_DOCS.push({
      liveDoc: GetPoolsSushiLiveDocument,
      doc: GetPoolsSushiDocument,
      name: "sushi",
      subscribe: sushi,
      execute: sushiExecute,
      filter: this.filter,
    });

    this.DEX_TO_DOCS.push({
      liveDoc: GetPoolsUniswapLiveDocument,
      doc: GetPoolsUniswapDocument,
      name: "uniswap",
      subscribe: uniswap,
      execute: uniswapExecute,
      filter: this.filter,
    });
    AppLogger.info(`DEXES_CONFIG_CREATED`);
  }
}
export interface IConfig {
  liveDoc: DocumentNode;
  doc: DocumentNode;
  name: string;
  subscribe: any;
  filter: any;
  execute: any;
}
