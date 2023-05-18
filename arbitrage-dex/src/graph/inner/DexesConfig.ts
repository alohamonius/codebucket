import { DocumentNode } from "graphql";
import {
  GetPoolsSushiDocument,
  GetPoolsSushiLiveDocument,
} from "../../graph/clients/sushi_rc/.graphclient";
import {
  GetPoolsUniswapDocument,
  GetPoolsUniswapLiveDocument,
} from "../../graph/clients/uniswap_rc/.graphclient";
import { singleton } from "tsyringe";

@singleton()
export default class DexesConfig {
  public DEX_TO_DOCS: IConfig[] = [];

  constructor() {
    this.DEX_TO_DOCS.push({
      liveDoc: GetPoolsSushiLiveDocument,
      doc: GetPoolsSushiDocument,
      name: "sushi",
    });

    this.DEX_TO_DOCS.push({
      liveDoc: GetPoolsUniswapLiveDocument,
      doc: GetPoolsUniswapDocument,
      name: "uniswap",
    });
    console.log("DEXES_CONFIG_CREATED");
  }
}
export interface IConfig {
  liveDoc: DocumentNode;
  doc: DocumentNode;
  name: string;
}
