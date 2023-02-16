import http from "http";
import { onNewPairsAdded as onNewPoolAdded } from "./scanner/base/onNewListing";
import { scanQuotes } from "./jobs/runner";
import { logQuote } from "./utils/logger";
import { aptosQuickswap } from "./scanner/aptosQuickSwap";
import { init } from "./bot/sui/sui";
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";

async function main() {
  // startListetingNewPools();
  // await aptosQuickswap();
  await init();
}

function startListetingNewPools() {
  dexesToScan.forEach((dex) => {
    onNewPoolAdded(PRIVATE_KEY, dex.chain, dex.name, (data) => {
      console.log("bnb pancake", data);
    });
  });
}

async function start1InchJob() {
  await scanQuotes(pairsToScan, 2000, (quote, from, to, chain) => {
    const { token1Value, token2Value } = quote;

    const percentsDifference = token2Value
      .minus(token1Value)
      .abs()
      .dividedBy(token2Value);

    logQuote(chain, from, to, token1Value, token2Value, percentsDifference);
  });
}

const dexesToScan = [
  { name: "uniswapv2", chain: "eth" },
  { name: "uniswapv3", chain: "eth" },
  { name: "pancake", chain: "bnb" },
];
const pairsToScan = [
  { chain: "eth", token1: "USDT", token2: "USDC" },
  { chain: "eth", token1: "USDT", token2: "BUSD" },
  { chain: "bnb", token1: "USDT", token2: "BUSD" },
  { chain: "bnb", token1: "USDT", token2: "USDC" },
];

(async () => {
  try {
    await main();
    http.createServer(function (req, res) {}).listen(88);
  } catch (e) {
    console.error(e);
  }
})();
