"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@graphql-mesh/runtime");
const cli_1 = require("@graphql-mesh/cli");
const path_1 = require("path");
const GraphSubscriptionManager_1 = __importDefault(require("./GraphSubscriptionManager"));
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-ethereum
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-bsc
//https://thegraph.com/hosted-service/subgraph/sushi-v3/v3-polygon
//v2
//https://thegraph.com/hosted-service/subgraph/sushiswap/bsc-exchange
//https://thegraph.com/hosted-service/subgraph/sushiswap/exchange (eth)
//https://thegraph.com/hosted-service/subgraph/sushiswap/matic-exchange
//я хочу робити квері і отримувати ціни з sushi3,uni3 + sushi2,uni2 + suhi,uni
//в ідеалі з можливістю робити кросчейн (матік, бсц, ефір)
//хоча я ще не знайшов бсц і матік ендпоінт для юні
//ну от, є в мене список цін на дексах (1,2) лише двох.
//
class DexGraphClient {
    constructor(dexName_, mesh_, document_, liveDocument_) {
        this.dexName = dexName_;
        this._mesh = mesh_;
        this._document = document_;
        this._liveDocument = liveDocument_;
        this._subscriptionManager = new GraphSubscriptionManager_1.default(this._mesh, this.dexName);
    }
    async fetch(filter) {
        const data = await this.execute(this._mesh, this._document, filter, this.dexName);
        return data;
    }
    async subscribe(variables, onData, hot = true) {
        const { stop, run } = await this._subscriptionManager.coldSubscription(this._liveDocument, variables, this.dexName, () => { }, onData);
        this._stop = stop;
        this._run = run;
        if (hot)
            await this._run();
    }
    async stopLiveData() {
        await (this._stop ? this._stop() : Promise.resolve());
    }
    async execute(mesh, document, vars, name) {
        const { v2, v3 } = (await mesh.execute(document, vars)).data;
        return { v2, v3 };
    }
}
_a = DexGraphClient;
DexGraphClient.Create = async (dex, document, liveDocument) => {
    const config = await (0, cli_1.findAndParseConfig)({
        dir: (0, path_1.join)(__dirname, "../clients/" + dex + "_rc"),
        configName: "graphclient",
        additionalPackagePrefixes: ["@graphprotocol/client-"],
    });
    const mesh = await (0, runtime_1.getMesh)(config);
    return new DexGraphClient(dex, mesh, document, liveDocument);
};
exports.default = DexGraphClient;
//   const pairs = detectDexPairs(
//     sushiswap.v2,
//     sushiswap.v3,
//     uniswap.v2,
//     uniswap.v3
//   );
// }
