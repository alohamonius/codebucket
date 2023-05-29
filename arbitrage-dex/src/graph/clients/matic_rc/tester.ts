import {
  getBuiltGraphSDK,
  execute,
  GetPoolsByIdsMaticDocument,
} from "./.graphclient";

(async () => {
  const where = {
    // totalValueLockedUSD_gt: 123332,
    // or: [
    //   { token0_in: ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f"] },
    //   { token1_in: ["0xc2132d05d31c914a87c6611c10748aeb04b58e8f"] },
    // ],
    // and: [{ totalValueLockedUSD_gt: 123 }],
  };
  const w = await getBuiltGraphSDK()
    .GetPoolsMatic({ first: 20000, skip: 0 })
    .catch((e) => {
      debugger;
      console.error(e);
    });
  const d = await execute(GetPoolsByIdsMaticDocument, {
    first: 9000,
    skip: 0,
    // where: where,
  });

  const data = await getBuiltGraphSDK()
    .GetPoolsByIdsMatic({
      first: 5000,
      skip: 0,
      where: where,
      // ...{
      //   totalValueLockedUSD_gt: 123,
      //   token0Price_gt: 0,
      //   token1Price_gt: 0,
      // },
    })
    .catch((e) => {});
  debugger;
})();
