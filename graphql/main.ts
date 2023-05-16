import {
  GetPoolsSushiDocument,
  GetPoolsSushiLiveDocument,
} from "./sushi_rc/.graphclient";
import {
  GetPoolsUniswapDocument,
  GetPoolsUniswapLiveDocument,
  GetPoolsUniswapLiveQuery,
} from "./uniswap_rc/.graphclient";
import { getMesh } from "@graphql-mesh/runtime";
import { findAndParseConfig } from "@graphql-mesh/cli";
import { join } from "path";
import { findCommonKeys, mapData, subscribe } from "./utils/utils";

async function graphInit(dex: string) {
  const config = await findAndParseConfig({
    dir: join(__dirname, "./" + dex + "_rc"),
    configName: "graphclient",
    additionalPackagePrefixes: ["@graphprotocol/client-"],
  });
  return getMesh(config);
}

//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-ethereum
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-bsc
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-polygon

//v2
//https://thegraph.com/hosted-service/subgraph/sushiswap/bsc-exchange
//https://thegraph.com/hosted-service/subgraph/sushiswap/exchange (eth)
//https://thegraph.com/hosted-service/subgraph/sushiswap/matic-exchange

//я хочу робити квері і отримувати ціни з sushi3,uni3 + sushi2,uni2 + suhi,uni
//в ідеалі з можливістю робити кросчейн (матік, бсц, ефір)
//хоча я ще не знайшов бсц і матік ендпоінт для юні

//ну от, є в мене список цін на дексах (1,2) лише двох.

async function main() {
  const meshSushi = await graphInit("sushi");
  const meshUniswap = await graphInit("uniswap");

  // const result2 = await meshSushi.execute(GetPoolsSushiDocument, {
  //   first: 100,
  //   skip: 0,
  //   totalLocked: 5000,
  // });

  // const result = await meshUniswap.execute(GetPoolsUniswapDocument, {
  //   first: 100,
  //   skip: 0,
  //   totalLocked: 10000,
  // });

  await Promise.all([
    subscribe(
      meshSushi,
      GetPoolsSushiLiveDocument,
      {
        first: 1,
        skip: 0,
        totalLocked: 5000,
      },
      (data) => {
        console.log("sushi", "v3", data.pools.length, "v2", data.pairs.length);
      }
    ),
    subscribe(
      meshUniswap,
      GetPoolsUniswapLiveDocument,
      {
        first: 1,
        skip: 0,
        totalLocked: 5000,
      },
      (data) => {
        console.log(
          "uniswap",
          "v3",
          data.pools.length,
          "v2",
          data.pairs.length
        );
      }
    ),
  ]);
  debugger;
  // debugger;

  // const { pools, pairs } = result.data;

  // const uniswapV3 = mapData(pools, "univ3");
  // const uniswapV2 = mapData(pairs, "univ2");

  // const commonKeys = findCommonKeys(uniswapV2, uniswapV3);

  // commonKeys.forEach((key) => {
  //   const x = uniswapV2[key];
  //   const y = uniswapV3[key];
  //   debugger;
  // });
}

main();
