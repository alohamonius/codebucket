import { autoInjectable, singleton } from "tsyringe";
// import DexesConfig from "../inner/DexesConfig";
import { DexDataHandler } from "../DexDataHandler";
import { AppLogger } from "../../utils/App.logger";
import Subscriber from "../inner/Subscriber";

@singleton()
@autoInjectable()
export default class LiveJob {
  handler: DexDataHandler;
  ready = false;
  _subscribers: Subscriber[] = [];
  constructor(handler_: DexDataHandler) {
    this.handler = handler_;
    AppLogger.info(`LiveJob ctor`);
  }

  async StartAsync() {
    // this.config.DEX_TO_DOCS.map(async (dex) => {
    //   // const repeater = await dex.subscribe(dex.liveDoc, dex.filter);
    //   // const iterator = repeater[Symbol.asyncIterator]();
    //   // const subscriber = new Subscriber();
    //   // subscriber.Start(iterator, dex.name, (name, data) => {
    //   //   this.handler.handle(name, data);
    //   // }); //not awaited, push and forgot, long running process
    //   // this._subscribers.push(subscriber);
    // });
  }

  async RestartAsync() {
    await this.StopAsync();
    await this.StartAsync();
  }

  private async StopAsync() {
    await Promise.all(this._subscribers.map((c) => c.Stop));
    this._subscribers = [];
  }
}
