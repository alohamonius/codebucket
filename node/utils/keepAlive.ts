import { ethers } from "ethers";

type KeepAliveParams = {
  provider: ethers.providers.WebSocketProvider;
  onDisconnect: (err: any) => void;
  expectedPongBack?: number;
  checkInterval?: number;
};

export function keepAlive({
  provider,
  onDisconnect,
  expectedPongBack = 15000,
  checkInterval = 7500,
}: KeepAliveParams) {
  let pingTimeout: NodeJS.Timeout | null = null;
  let keepAliveInterval: NodeJS.Timeout | null = null;

  provider._websocket.on("open", () => {
    console.log("Listening...");
    keepAliveInterval = setInterval(() => {
      provider._websocket.ping();

      pingTimeout = setTimeout(() => {
        provider._websocket.terminate();
      }, expectedPongBack);
    }, checkInterval);
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  provider._websocket.on("close", (err: any) => {
    console.log("closed");
    if (keepAliveInterval) clearInterval(keepAliveInterval);
    if (pingTimeout) clearTimeout(pingTimeout);
    onDisconnect(err);
  });

  provider._websocket.on("pong", () => {
    if (pingTimeout) clearInterval(pingTimeout);
  });
}
