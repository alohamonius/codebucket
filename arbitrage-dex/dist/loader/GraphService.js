"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const runtime_1 = require("@graphql-mesh/runtime");
const cli_1 = require("@graphql-mesh/cli");
const path_1 = require("path");
const utils_1 = require("../utils/utils");
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
class GraphService {
    constructor(dexName, mesh) {
        this._dexName = dexName;
        this._mesh = mesh;
        this._subscriptionManager = new GraphSubscriptionManager_1.default(this._mesh, this._dexName);
    }
    async fetch(filter, document) {
        const data = await this.execute(this._mesh, document, filter, this._dexName);
        return data;
    }
    async subscribe(document, variables, onNewData) {
        await this._subscriptionManager.subscribe(document, variables, onNewData);
    }
    stopLiveData() {
        this._subscriptionManager.stop();
    }
    async execute(mesh, document, vars, name) {
        const { v2, v3 } = (await mesh.execute(document, vars)).data;
        const datav2 = (0, utils_1.mapData)(v2, name + "v2");
        const datav3 = (0, utils_1.mapData)(v3, name + "v3");
        return {
            v2: datav2,
            v3: datav3,
        };
    }
}
_a = GraphService;
GraphService.Create = async (dex) => {
    const config = await (0, cli_1.findAndParseConfig)({
        dir: (0, path_1.join)(__dirname, "../" + dex + "_rc"),
        configName: "graphclient",
        additionalPackagePrefixes: ["@graphprotocol/client-"],
    });
    const mesh = await (0, runtime_1.getMesh)(config);
    return new GraphService(dex, mesh);
};
exports.default = GraphService;
//   const pairs = detectDexPairs(
//     sushiswap.v2,
//     sushiswap.v3,
//     uniswap.v2,
//     uniswap.v3
//   );
// }
