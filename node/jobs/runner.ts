import { SCAN_CONFIG, INCH_CHAINS } from "../pure/constants";
import { inchQuote } from "../arbitrage/1inch";
import { IPair } from "./IPair";

export async function scanQuotes(
  pairs: IPair[],
  timeout: number,
  onNewQuote: any
) {
  return Promise.all(
    pairs.map((pair) => infiniteRunQuoteScan(pair, timeout, onNewQuote))
  );
}

async function infiniteRunQuoteScan(
  pair: IPair,
  timeout: number,
  onNewQuote: any
) {
  const usdValue = 50;
  const from = SCAN_CONFIG[pair.chain][pair.token1];
  const to = SCAN_CONFIG[pair.chain][pair.token2];

  return Promise.resolve()
    .then(async function resolver() {
      return quote(from, to, usdValue, pair.chain, timeout, onNewQuote).then(
        resolver
      );
    })
    .catch((error) => {
      console.log("Error: " + error);
    });
}

async function quote(
  from,
  to,
  usdValue,
  chain,
  timeout: number,
  onNewQuote: any
) {
  const quote = await inchQuote(from, to, usdValue, INCH_CHAINS[chain]);
  onNewQuote(quote, from, to, chain);
  await new Promise((res) => setTimeout(res, timeout));
  return Promise.resolve(true);
}
