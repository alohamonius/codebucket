export const APTOS_COIN = "0x1::aptos_coin::AptosCoin";

export function asset(account: string, name: string) {
  return `${account}::asset::${name}`;
}
