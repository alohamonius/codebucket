import { autoInjectable, singleton } from "tsyringe";
import DexesConfig from "../inner/DexesConfig";
import { DexDataHandler } from "../DexDataHandler";
import { AppLogger } from "../../utils/App.logger";
import cron from "node-cron";

@singleton()
@autoInjectable()
export default class PollingJob {
  config: DexesConfig;
  handler: DexDataHandler;

  jobs: cron.ScheduledTask[] = [];

  constructor(config_: DexesConfig, handler_: DexDataHandler) {
    this.config = config_;
    this.handler = handler_;
    AppLogger.info(`PollingJob ctor`);
  }

  async StartAsync(seconds: number) {
    this.config.DEX_TO_DOCS.map(async (dex) => {
      const task = cron.schedule(`*/${seconds} * * * * *`, async () => {
        const data = await dex.execute(dex.doc, dex.filter);
        this.handler.handle(dex.name, data.data);
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
