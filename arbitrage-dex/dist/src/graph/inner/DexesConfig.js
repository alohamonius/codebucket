"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const _graphclient_1 = require("../../graph/clients/sushi_rc/.graphclient");
const _graphclient_2 = require("../../graph/clients/uniswap_rc/.graphclient");
const tsyringe_1 = require("tsyringe");
let DexesConfig = class DexesConfig {
    constructor() {
        this.DEX_TO_DOCS = [];
        this.DEX_TO_DOCS.push({
            liveDoc: _graphclient_1.GetPoolsSushiLiveDocument,
            doc: _graphclient_1.GetPoolsSushiDocument,
            name: "sushi",
        });
        this.DEX_TO_DOCS.push({
            liveDoc: _graphclient_2.GetPoolsUniswapLiveDocument,
            doc: _graphclient_2.GetPoolsUniswapDocument,
            name: "uniswap",
        });
        console.log("DEXES_CONFIG_CREATED");
    }
};
DexesConfig = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [])
], DexesConfig);
exports.default = DexesConfig;
