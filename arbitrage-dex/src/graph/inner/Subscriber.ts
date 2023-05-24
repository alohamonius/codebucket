import { AppLogger } from "../../utils/App.logger";
import { delay } from "../../utils/utils";

export default class Subscriber {
  private _iterator: any;
  private _dexName: string;
  private stopIteration: boolean = false;
  private stopped: boolean = false;
  async Start(iterator: any, dexName: string, handler: any) {
    this._dexName = dexName;
    this._iterator = iterator;
    while (!this.stopIteration) {
      const { value, done } = await iterator.next();

      if (done) {
        break;
      }
      if (!value.data) {
        AppLogger.error(`${value.errors.map((e: any) => e.message)}`);
        continue;
      }

      handler(dexName, value.data);
    }
    this.stopped = true;
  }
  async Stop() {
    this._iterator.return?.();
    this.stopIteration = true;
    while (this.stopped !== true) {
      await delay(100);
    }
    AppLogger.info(`${this._dexName} iterator stopped`);
    return Promise.resolve(true);
  }
}
