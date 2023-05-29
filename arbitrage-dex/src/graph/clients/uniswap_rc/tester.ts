import { getBuiltGraphSDK, execute } from "./.graphclient";

(async () => {
  const w = await getBuiltGraphSDK().GetPoolsUniswap({ first: 20000, skip: 0 });
  debugger;
})();
