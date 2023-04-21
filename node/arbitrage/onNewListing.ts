import { ethers } from "ethers";
import { DEX_FAMILY, SCAN_CONFIG } from "../pure/constants";
import { keepAlive } from "../utils/keepAlive";

export function onNewPairsAdded(
  privateKey,
  chain: string,
  exchange: string,
  onNewListing: any
) {
  const rpcWsUrl = SCAN_CONFIG[chain].rpcWs;
  const provider = new ethers.providers.WebSocketProvider(rpcWsUrl);

  keepAlive({
    provider,
    onDisconnect: (err) => {
      onNewPairsAdded(privateKey, chain, exchange, onNewListing);
      console.error(
        "The ws connection was closed",
        JSON.stringify(err, null, 2)
      );
    },
  });

  const wallet = new ethers.Wallet(privateKey, provider);
  const signer = wallet.connect(provider);

  const exchangeInfo = SCAN_CONFIG[chain][exchange];

  const event = DEX_FAMILY[exchangeInfo.family];

  const factory = new ethers.Contract(
    exchangeInfo.factory,
    [event.onNewPair.event],
    signer
  );

  factory.on(event.onNewPair.name, (data) => {
    onNewListing(data);
  });
}
