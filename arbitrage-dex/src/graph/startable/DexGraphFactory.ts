import { autoInjectable, singleton } from "tsyringe";
import DexesConfig from "../inner/DexesConfig";
import DexGraphClient from "../inner/DexGraphClient";
import { DexDataHandler } from "../DexDataHandler";
import { AppLogger } from "../../utils/App.logger";

@singleton()
@autoInjectable()
export default class DexGraphFactory {
  graphs: DexGraphClient[] = [];
  config: DexesConfig;
  handler: DexDataHandler;
  ready = false;
  constructor(config_: DexesConfig, handler_: DexDataHandler) {
    this.config = config_;
    this.handler = handler_;
    AppLogger.info(`DexGraphFactory ctor`);
  }

  async StartAsync() {
    this.graphs = await Promise.all(
      this.config.DEX_TO_DOCS.map((dex) => {
        return DexGraphClient.Create(dex.name, dex.doc, dex.liveDoc);
      })
    );
    this.ready = true;
  }

  public async runBackgroundFetchData(filter: any) {
    if (!this.ready) return Promise.reject("not started");
    await Promise.all(
      this.graphs.map((graph) =>
        graph.subscribe(filter, (data: any) => {
          data = null;
          // this.handler.handle(graph.dexName, data);
        })
      )
    );
  }
}
