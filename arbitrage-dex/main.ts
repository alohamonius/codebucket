import "reflect-metadata";
import { Lifecycle, container } from "tsyringe";
import DexGraphFactory from "./src/graph/startable/DexGraphFactory";
import ExpressApi from "./api";
import { AppLogger } from "./src/utils/App.logger";
import { DexPairsRepository } from "./src/graph/DexPairsRepository";
(async () => {
  const startable = container.resolve(DexGraphFactory);
  const repository = new DexPairsRepository();
  // container.registerInstance("DexPairsRepository", repository);
  const api = new ExpressApi();

  const port = 3000;

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
