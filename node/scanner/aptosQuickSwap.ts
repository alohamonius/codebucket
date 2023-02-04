import { ethers, Wallet } from "ethers";
import { SCAN_CONFIG } from "../pure/constants";
import { AptosClient } from "aptos";

const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

function asset(account, name) {
  return `${account}::asset::${name}`;
}
function struct(poolAddress, coin1, coin2) {
  return `${poolAddress}::liquidity_pool::EventsStore<${coin1}, ${coin2}, ${poolAddress}::curves::Uncorrelated>`;
}

//USDC/APT Quickswap get events
export async function aptosQuickswap() {
  const url = SCAN_CONFIG["apt"].rpcHttp;
  const poolAddress = SCAN_CONFIG["apt"].quickswap.liquidityPool;
  const usdc = SCAN_CONFIG["apt"].USDC.wallet;

  const client = new AptosClient(url);
  const coin1 = asset(usdc, "USDC");
  const eventHandleStruct = struct(poolAddress, coin1, APTOS_COIN);

  const swapEvents = await client.getEventsByEventHandle(
    SCAN_CONFIG["apt"].quickswap.factory,
    eventHandleStruct,
    "swap_handle"
  );

  const loansEvents = await client.getEventsByEventHandle(
    SCAN_CONFIG["apt"].quickswap.factory,
    eventHandleStruct,
    "flashloan_handle"
  );
  const poolCreatedEvents = await client.getEventsByEventHandle(
    SCAN_CONFIG["apt"].quickswap.factory,
    eventHandleStruct,
    "pool_created_handle"
  );
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
