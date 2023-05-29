import { getBuiltGraphSDK, execute } from "./.graphclient";

(async () => {
  const w = await getBuiltGraphSDK().GetPoolsEth({ first: 20000, skip: 0 });
  debugger;
})();
