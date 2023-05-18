import "reflect-metadata";
import { container } from "tsyringe";
import DexGraphFactory from "./src/graph/startable/DexGraphFactory";
import ExpressApi from "./api";
import { AppLogger } from "./app.logger";
(async () => {
  const startable = container.resolve(DexGraphFactory);

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
    AppLogger.info("", `API started on port:${port}`);
  });
})();
