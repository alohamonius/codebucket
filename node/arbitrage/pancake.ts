import { ethers } from "ethers";
import { SCAN_CONFIG } from "../pure/constants";

async function uniswap(pk: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth/654125c8b0e8e1c5bd46d74e54de8b6cc6444f16f15939b3ca9d8845fcd95985"
  );
  //getPairs
  //for every pair .getReserves

  ("function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)");
}
async function pancakeGetAmountsOut(privateKey) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/bsc"
  );

  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = wallet.connect(provider);

  const routerBnb = new ethers.Contract(
    SCAN_CONFIG.bnb.pancake.router,
    [
      "function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)",
    ],
    signer
  );

  while (true) {
    const amountIn = ethers.utils.parseUnits("1000", "ether");
    const amounts = await routerBnb.getAmountsOut(amountIn, [
      SCAN_CONFIG.bnb.USDT,
      SCAN_CONFIG.bnb.BUSD,
    ]);
    console.log(
      "USDC:" + amounts[0].toString(),
      "/t",
      "BUSD:" + amounts[1].toString()
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}
