import { getBuiltGraphSDK, execute } from "./.graphclient";

(async () => {
  const w = await getBuiltGraphSDK().GetPoolsSushi({ first: 20000, skip: 0 });
  debugger;
})();
