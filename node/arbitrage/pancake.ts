import { ethers } from "ethers";
import { SCAN_CONFIG } from "../pure/constants";

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
