import OneInchApi, { InchV4Chains } from "@normalizex/1inch-api-v4";
import BigNumber from "bignumber.js";
import { ethers } from "ethers";
import { DEFAULT_DECIMALS } from "../pure/constants";
import { zeros } from "../utils/zeros";

export async function inchQuote(token1, token2, usdValue, chainId: number) {
  const Inch = new OneInchApi(chainId);
  const usdValueChained = +ethers.utils.parseUnits(
    "" + usdValue,
    token1.decimals
  );

  const quote = await Inch.quote(
    token1.address,
    token2.address,
    usdValueChained
  );

  const token1Value = ethers.utils.formatUnits(
    quote.fromTokenAmount,
    quote.fromToken.decimals + zeros(usdValue) - 1
  );

  const token2Value = ethers.utils.formatUnits(
    quote.toTokenAmount,
    quote.toToken.decimals + zeros(usdValue) - 1
  );

  return {
    quote: quote,
    token1Value: BigNumber(token1Value).dp(DEFAULT_DECIMALS),
    token2Value: BigNumber(token2Value).dp(DEFAULT_DECIMALS),
  };
}
