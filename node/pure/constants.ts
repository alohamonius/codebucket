require("dotenv").config();
const ANKR_WS_BSC_RPC = process.env.ANKR_WS_BSC_RPC || "";
const ANKR_WS_ETH_RPC = process.env.ANKR_WS_ETH_RPC || "";
const ANKR_HTTP_BSC_RPC = process.env.ANKR_HTTP_BSC_RPC || "";
const ANKR_HTTP_ETH_RPC = process.env.ANKR_HTTP_ETH_RPC || "";
const ANKR_HTTP_APT_RPC = process.env.ANKR_HTTP_APT_RPC || "";

export const DEX_FAMILY = {
  uniswap: {
    onNewPair: {
      event:
        "event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
      name: "PairCreated",
    },
  },
  uniswapv3: {
    onNewPair: {
      event:
        "event PoolCreated(address indexed token0,address indexed token1,uint24 indexed fee,int24 tickSpacing,address pool)",
      name: "PoolCreated",
    },
  },
};
export const DEFAULT_DECIMALS = 6;

export const SCAN_CONFIG = {
  apt: {
    rpcHttp: ANKR_HTTP_APT_RPC,
    quickswap: {
      factory:
        "0x05a97986a9d031c4567e15b797be516910cfcb4156312482efc6a19c0a30c948",
      liquidityPool:
        "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12",
    },
    aux: {
      factory:
        "0xbd35135844473187163ca197ca93b2ab014370587bb0ed3befff9e902d6bb541",
    },
    USDC: {
      address:
        "0xf22bede237a07e121b56d91a491eb7bcdfd1f5907926a9e58338f964a01b17fa",
    },
  },
  eth: {
    rpcWs: ANKR_WS_ETH_RPC,
    rpcHttp: ANKR_HTTP_ETH_RPC,

    uniswapv3: {
      factory: "0x1f98431c8ad98523631ae4a59f267346ea31f984",
      family: "uniswapv3",
    },
    uniswapv2: {
      factory: "0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f",
      family: "uniswap",
    },
    sushi: {
      factory: "0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac",
      router: "",
      family: "uniswap",
    },

    pancake: {
      factory: "0x1097053Fd2ea711dad45caCcc45EfF7548fCB362",
      router: "0xEfF92A263d31888d860bD50809A8D171709b7b1c",
      family: "uniswap",
    },

    USDC: {
      address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      name: "USDC",
      decimals: 6,
    },
    USDT: {
      address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      name: "USDT",
      decimals: 6,
    },
    BUSD: {
      address: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
      name: "BUSD",
      decimals: 6,
    },
  },
  bnb: {
    rpcWs: ANKR_WS_BSC_RPC,
    rpcHttp: ANKR_HTTP_BSC_RPC,

    pancake: {
      family: "uniswap",
      factory: "0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73",
      router: "0x10ED43C718714eb63d5aA57B78B54704E256024E",
    },
    sushi: {
      family: "uniswap",
      factory: "0xc35dadb65012ec5796536bd9864ed8773abc74c4",
      router: "",
    },

    USDC: {
      wallet: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      name: "USDC",
      decimals: 18,
    },
    USDT: {
      wallet: "0x55d398326f99059ff775485246999027b3197955",
      name: "USDT",
      decimals: 18,
    },
    BUSD: {
      wallet: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
      name: "BUSD",
      decimals: 18,
    },
  },
};

export const INCH_CHAINS = {
  bnb: 56,
  eth: 1,
};
