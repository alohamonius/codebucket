import { PairFilter } from "./PairFilter";
import {
  GetPoolsDocument,
  GetPoolsLiveDocument,
  getBuiltGraphSDK,
} from "./.graphclient";
import { getMesh, GetMeshOptions, MeshInstance } from "@graphql-mesh/runtime";
import { findAndParseConfig } from "@graphql-mesh/cli";
import { join } from "path";

async function main() {
  const config = await findAndParseConfig({
    dir: join(__dirname, "../graphql"),
    configName: "graphclient",
    additionalPackagePrefixes: ["@graphprotocol/client-"],
  });
  const mesh = await getMesh(config);
  const result = await mesh.execute(GetPoolsDocument, {
    first: 100,
    skip: 0,
  });
  // якщо уявити собі що юнісвап(в3) буде джерело першим
  //потім будемо бігати по cyber, sushi, univ2?
  //відштовхуючись від ціни графа, я пробігаюсь по всім парам в cyber/sushi і вишукую різницю.
  const { pools, pairs } = result.data;

  let poolToData = {
    v3: {},
    v2: {},
  };

  pools.forEach((element) => {
    poolToData["v3"][keyV3(element)] = {
      left: element.token0.id,
      right: element.token1.id,
      price: [element.token0Price, element.token1Price],
    };
    debugger;
  });
}

async function subscribe(mesh: MeshInstance, onNewData: any) {
  const repeater = await mesh.subscribe(
    GetPoolsLiveDocument,
    { first: 1, skip: 0, containsId: [] },
    {},
    "GetPools"
  );
  for await (let x of repeater[Symbol.asyncIterator]()) {
    onNewData(x.data);
  }
}

function keyV3(element: any) {
  return `${element.id}_${element.token0.symbol}/${element.token1.symbol}`;
}
main();
