import http from "http";
import { onNewPairsAdded as onNewPoolAdded } from "./arbitrage/onNewListing";
import { scanQuotes } from "./jobs/runner";
import { logQuote } from "./utils/logger";
import { init } from "./bot/sui/sui";
import { Configuration, CreateCompletionRequest, OpenAIApi } from "openai";

require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const GPT_ORG_ID = process.env.GPT_ORG_ID || "";
const GPT_API_KEY = process.env.GPT_API_KEY || "";

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

async function main() {
  // startListetingNewPools(dexesToScan);
  // await aptosQuickswap();
  //await init();
}

function startListetingNewPools(toScan: any[]) {
  toScan.forEach((dex) => {
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

(async () => {
  try {
    await main();
    http.createServer(function (req, res) {}).listen(88);
  } catch (e) {
    console.error(e);
  }
})();
