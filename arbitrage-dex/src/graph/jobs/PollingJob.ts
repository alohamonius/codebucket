import { autoInjectable, singleton } from "tsyringe";
import { DexDataHandler } from "../DexDataHandler";
import { AppLogger } from "../../utils/App.logger";
import cron from "node-cron";
import { DexChainData } from "./DexChainData";
import {
  ChainGraphDexExecutor,
  GraphApiResponse,
} from "../inner/ChainGraphDexExecutor";

@singleton()
@autoInjectable()
export default class PollingJob {
  handler: DexDataHandler;
  executor = new ChainGraphDexExecutor();
  jobs: cron.ScheduledTask[] = [];
  lock: Map<string, boolean> = new Map<string, boolean>();

  // dex = ["sushi", "uniswap", "pancake"];

  constructor(handler_: DexDataHandler) {
    this.handler = handler_;
    AppLogger.info(`PollingJob ctor`);
  }

  async StartAsync(seconds: number): Promise<GraphApiResponse[]> {
    const chains = this.executor.getChains();

    const w = Promise.all(
      chains.map(async (chain) => {
        if (this.lock.get(chain)) return;
        const start = Date.now();
        const data = await this.executor.getChainData(chain);
        const end = Date.now();

        return data;
        // if (chainResult.data === null) {
        //   AppLogger.error(chainResult.errors.map((c) => c.message));
        //   return;
        // }
      })
    );
    return w;

    //   this.config.DEX_TO_DOCS.map(async (dex) => {
    //     const task = cron.schedule(`*/${seconds} * * * * *`, async () => {
    //       if (this.lock.get(dex.name)) return;

    //       const start = Date.now();
    //       this.lock.set(dex.name, true);
    //       const result = await dex.execute();
    //       const end = Date.now();

    //       if (result.data === null) {
    //         AppLogger.error(result.errors.map((c) => c.message));
    //         return;
    //       }
    //       AppLogger.info(`${dex.name} executed: ${end - start} ms`);

    //       const parsedData: GraphData[] = createGraphData(result);

    //       this.handler.handle(parsedData);

    //       this.lock.set(dex.name, false);

    //       return;
    //     });
    //     task.start();

    //     this.jobs.push(task);
    //   });
    //   AppLogger.info(`PollingJob started, ${cron.getTasks()}`);
    // }

    // async StopAsync() {
    //   this.jobs.forEach((job) => {
    //     job.stop();
    //   });
    //   this.jobs = [];
    // }
  }
}
