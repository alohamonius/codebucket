import { ethers } from "ethers";

async function uniswap(pk: string) {
  const provider = new ethers.providers.JsonRpcProvider(
    "https://rpc.ankr.com/eth/"
  );
  ("function getReserves() public view returns (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)");
}
