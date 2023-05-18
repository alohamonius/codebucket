import { expect, assert } from "chai";
import { DexDataHandler } from "../graph/DexDataHandler";
import { distinct, getPairIds, pairToPools } from "../utils/utils";
import { Fs } from "../utils/fs.module";
import { Pair } from "../graph/types";
import { join } from "path";

describe("test", async () => {
  const uni3 = await Fs.loadFileAsync<Pair[]>(
    join(__dirname, "/data/uniswapv3mini.json")
  ); //4
  const sushi2 = await Fs.loadFileAsync<Pair[]>(
    join(__dirname, "/data/sushiv2mini.json")
  ); //6

  it("distinct in many arrays should work correct", async () => {
    const ids3 = getPairIds(uni3);
    const ids2 = getPairIds(sushi2);

    const uniquePairs = distinct(ids2, ids3);

    assert(uni3.length === 4, "uniswapv3mini.json file was changed");
    assert(sushi2.length === 6, "sushiv2mini.json file was changed");
    assert(uniquePairs.length === 7, "distinct works incorect");
  });
});

//хочу зробити тест для знаходження спільних пулів між різними дексами (detectDexPairs)
//logger typescript with DI
