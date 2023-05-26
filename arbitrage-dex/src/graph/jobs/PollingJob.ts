import { autoInjectable, singleton } from "tsyringe";
import DexesConfig from "../inner/DexesConfig";
import { DexDataHandler } from "../DexDataHandler";
import { AppLogger } from "../../utils/App.logger";
import cron from "node-cron";
import { DexChainData } from "./DexChainData";

function toDexChainData(result: any): DexChainData[] {
  return Object.keys(result).map((key) => {
    const fields = key.split("_");
    const dexName = fields[0];
    const chain = fields[1];
    const version = fields[2];
    const data = result[key];
    return { dexName, chain, version, data };
  });
}
@singleton()
@autoInjectable()
export default class PollingJob {
  config: DexesConfig;
  handler: DexDataHandler;

  jobs: cron.ScheduledTask[] = [];
  lock: Map<string, boolean> = new Map<string, boolean>();

  // dex = ["sushi", "uniswap", "pancake"];

  constructor(config_: DexesConfig, handler_: DexDataHandler) {
    this.config = config_;
    this.handler = handler_;
    AppLogger.info(`PollingJob ctor`);
  }

  async StartAsync(seconds: number) {
    this.config.DEX_TO_DOCS.map(async (dex) => {
      const task = cron.schedule(`*/${seconds} * * * * *`, async () => {
        if (this.lock.get(dex.name)) return;

        const start = Date.now();
        this.lock.set(dex.name, true);
        const result = await dex.execute();
        const end = Date.now();

        if (result.data === null) {
          AppLogger.error(result.errors.map((c) => c.message));
          return;
        }
        AppLogger.info(`${dex.name} executed: ${end - start} ms`);

        const parsedData: DexChainData[] = toDexChainData(result);

        this.handler.handle(parsedData);

        this.lock.set(dex.name, false);

        return;
      });
      task.start();

      this.jobs.push(task);
    });
    AppLogger.info(`PollingJob started, ${cron.getTasks()}`);
  }

  async StopAsync() {
    this.jobs.forEach((job) => {
      job.stop();
    });
    this.jobs = [];
  }
}
