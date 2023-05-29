import "reflect-metadata";
import { container } from "tsyringe";
import { AppLogger } from "./src/utils/App.logger";
import ExpressApi from "./Api";
import { getMemoryUsage } from "./src/utils/utils";
import LiveJob from "./src/graph/jobs/LiveJob";
import PollingJob from "./src/graph/jobs/PollingJob";
import { ChainGraphDexExecutor } from "./src/graph/inner/ChainGraphDexExecutor";
import { Chain, GraphPairId } from "./src/models/GraphId";

const MEMORY_LIMIT_TO_RESTART_SUBSCRIPTIONS_MB = 1800;
const DEFAULT_POLLING_INTERVAL_SECONDS = 15;

const liveJob = container.resolve(LiveJob);
const pollingJob = container.resolve(PollingJob);

(async () => {
  var s = new ChainGraphDexExecutor();

  //проблема така, є пара weth/usdt , але також є пара dai/weth.
  //але шукаю я weth_usdt, weth_dai або навпаки usdt_weth, dai_weth
  //звісно хочу я отримати weth/dai, weth/usdt або навпаки dai/weth, usdt/weth

  //Тоді якщо я кажу token0_in[weth,dai] token1_in[usdt]
  //USDC_WETH
  //USDT_XYZ

  //USDC_XYZ
  // const p = new GraphPairId(
  //   "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //weth
  //   "0x6b175474e89094c44da98b954eedeac495271d0f" //DAI
  // );
  // const p2 = new GraphPairId(
  //   "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", //weth
  //   "0xdac17f958d2ee523a2206206994597c13d831ec7" //usdt
  // );
  // const w = await s.getAll();
  // const ids = await s.getByIds(Chain.eth, [p, p2]);

  const api = new ExpressApi();

  getMemoryUsage();

  const port = +process.env.PORT || 3000;

  const w = await pollingJob.StartAsync(DEFAULT_POLLING_INTERVAL_SECONDS);
  debugger;
  api.run(port, () => {
    AppLogger.info(`API started on port:${port}`);
  });

  setInterval(async () => {
    AppLogger.info(`Memory usage checker`);
    const { heapUsed } = getMemoryUsage();

    AppLogger.info(`Memory is okay Heap: ${heapUsed}MB`);
  }, 10000);
})();
