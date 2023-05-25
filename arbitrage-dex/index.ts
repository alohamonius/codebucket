import "reflect-metadata";
import { container } from "tsyringe";
import { AppLogger } from "./src/utils/App.logger";
import ExpressApi from "./Api";
import { getMemoryUsage } from "./src/utils/utils";
import LiveJob from "./src/graph/jobs/LiveJob";
import PollingJob from "./src/graph/jobs/PollingJob";

const MEMORY_LIMIT_TO_RESTART_SUBSCRIPTIONS_MB = 1800;
const DEFAULT_POLLING_INTERVAL_SECONDS = 15;

const liveJob = container.resolve(LiveJob);
const pollingJob = container.resolve(PollingJob);

(async () => {
  const api = new ExpressApi();

  getMemoryUsage();

  const port = +process.env.PORT || 3000;

  await pollingJob.StartAsync(DEFAULT_POLLING_INTERVAL_SECONDS);

  api.run(port, () => {
    AppLogger.info(`API started on port:${port}`);
  });

  setInterval(async () => {
    AppLogger.info(`Memory usage checker`);
    const { heapUsed } = getMemoryUsage();

    AppLogger.info(`Memory is okay Heap: ${heapUsed}MB`);
  }, 10000);
})();
