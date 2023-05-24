import "reflect-metadata";
import { container } from "tsyringe";
import Starter from "./src/graph/startable/Starter";
import { AppLogger } from "./src/utils/App.logger";
import ExpressApi from "./Api";
import { getMemoryUsage } from "./src/utils/utils";

const MEMORY_LIMIT_TO_RESTART_SUBSCRIPTIONS_MB = 1800;

const startable = container.resolve(Starter);

(async () => {
  const api = new ExpressApi();

  getMemoryUsage();

  const port = +process.env.PORT || 3000;

  await startable.StartAsync();

  api.run(port, () => {
    AppLogger.info(`API started on port:${port}`);
  });

  setInterval(async () => {
    AppLogger.info(`Memory usage checker`);
    const { heapUsed } = getMemoryUsage();
    if (heapUsed > MEMORY_LIMIT_TO_RESTART_SUBSCRIPTIONS_MB) {
      await startable.RestartAsync();
      AppLogger.info(`Subscription restarted`);
    }
    AppLogger.info(`Memory is okay Heap: ${heapUsed}MB`);
  }, 25000);
})();
