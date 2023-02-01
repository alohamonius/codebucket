import { ethers, Wallet } from "ethers";
import { SCAN_CONFIG } from "../pure/constants";
import {
  AptosClient,
  AptosAccount,
  FaucetClient,
  BCS,
  TxnBuilderTypes,
} from "aptos";
const NODE_URL =
  process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL =
  process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

const aptosCoinStore = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
const x = "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>";
const d = "0x1::coin::DepositEvent";
export async function listenAptos(privateKey) {
  const url = SCAN_CONFIG["apt"].rpcHttp;
  const client = new AptosClient(url);

  const my =
    "0xa909e657a473361b565f79d85b1ba196044cbae70342bd95559f1833b5e11738";
  const qw = await client.getAccount(my);
  const eew = await client.getAccountResources(my);

  const weqq = await client.getEventsByEventHandle(
    SCAN_CONFIG["apt"].quickswap.factory,
    "",
    ""
  );
  const provider = new ethers.providers.JsonRpcProvider(url);
  const signer = new Wallet(privateKey, provider);

  const contract = new ethers.Contract(
    SCAN_CONFIG["apt"].quickswap.factory,
    [],
    signer
  );

  contract.on("LiquidityAddedEvent", (ee) => {
    console.log(ee);
  });
}
// event::emit_event(
//     &mut events_store.pool_created_handle,
//     PoolCreatedEvent<X, Y, Curve> {
//         creator: signer::address_of(acc)
//     },
// );

// struct PoolCreatedEvent<phantom X, phantom Y, phantom Curve> has drop, store {
//     creator: address,
// }

// struct LiquidityAddedEvent<phantom X, phantom Y, phantom Curve> has drop, store {
//     added_x_val: u64,
//     added_y_val: u64,
//     lp_tokens_received: u64,
// }

// struct LiquidityRemovedEvent<phantom X, phantom Y, phantom Curve> has drop, store {
//     returned_x_val: u64,
//     returned_y_val: u64,
//     lp_tokens_burned: u64,
// }

// struct SwapEvent<phantom X, phantom Y, phantom Curve> has drop, store {
//     x_in: u64,
//     x_out: u64,
//     y_in: u64,
//     y_out: u64,
// }

// struct FlashloanEvent<phantom X, phantom Y, phantom Curve> has drop, store {
//     x_in: u64,
//     x_out: u64,
//     y_in: u64,
//     y_out: u64,
// }
