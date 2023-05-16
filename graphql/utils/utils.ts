import { getMesh, GetMeshOptions, MeshInstance } from "@graphql-mesh/runtime";
import { DocumentNode } from "graphql";
// import {
//   GetPoolsDocument,
//   GetPoolsLiveDocument,
//   getBuiltGraphSDK,
// } from "../.graphclient";

export function findCommonKeys(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  return keys1.filter((key) => keys2.includes(key));
}

export function mapData(data, exchange) {
  const dict = {};
  data.forEach((element) => {
    const key = toKey(element);
    const poolInfo = {
      id: element.id,
      price0: element.token0Price,
      price1: element.token1Price,
      pair: element.token0.symbol + "/" + element.token1.symbol,
      fee: element.feeTier ? parseFloat(element.feeTier) / 10000 : 0,
      exchange: exchange,
    };

    if (Object(dict).hasOwnProperty(key)) {
      console.log(key, "existed");
      dict[key].push(poolInfo);
    } else {
      dict[key] = [poolInfo];
    }
  });
  return dict;
}

function toKey(element) {
  return (element.token0.id + "_" + element.token1.id).toLowerCase();
}
function decKey(key: string) {
  const ids = key.split("_");
  return { token0Id: ids[0], token1Id: ids[1] };
}

export async function subscribe(
  mesh: MeshInstance,
  document: DocumentNode,
  variables: any,
  onNewData: any
) {
  const repeater = await mesh.subscribe(
    document,
    { first: 1, skip: 0, containsId: [] },
    {},
    "GetPools"
  );
  for await (let x of repeater[Symbol.asyncIterator]()) {
    onNewData(x.data);
  }
}
