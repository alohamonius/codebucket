import "reflect-metadata";
import { Lifecycle, container } from "tsyringe";
import DexGraphFactory from "./src/graph/startable/DexGraphFactory";
import { AppLogger } from "./src/utils/App.logger";
import { DexPairsRepository } from "./src/graph/DexPairsRepository";
import ExpressApi from "./Api";
import { logMemory } from "./src/utils/utils";
(async () => {
  const startable = container.resolve(DexGraphFactory);
  const api = new ExpressApi();

  logMemory();

  const port = +process.env.PORT || 3000;

  await startable.StartAsync();

  const filter = {
    first: 30000,
    skip: 0,
    totalLocked: 5000,
  };
  startable.runBackgroundFetchData(filter); //not await for now

  api.run(port, () => {
    AppLogger.info(`API started on port:${port}`);
  });
})();
