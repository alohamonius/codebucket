import http from "http";
require("dotenv").config();

async function main() {
  // startListetingNewPools(dexesToScan);
  // await aptosQuickswap();
  //await init();
}

(async () => {
  try {
    await main();
    http.createServer(function (req, res) {}).listen(88);
  } catch (e) {
    console.error(e);
  }
})();
