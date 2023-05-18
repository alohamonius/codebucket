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
exports.DexDataHandler = void 0;
const tsyringe_1 = require("tsyringe");
const utils_1 = require("../utils/utils");
const DexPairsRepository_1 = require("./DexPairsRepository");
let DexDataHandler = class DexDataHandler {
    constructor(repository) {
        this.uniquePairs = [];
        this.pairsToPools = new Map();
        this._db = new Map();
        this._storage = repository;
    }
    async handle(exchangeName, data) {
        if ("v2" in data && "v3" in data) {
            const datav2 = (0, utils_1.toDictinary)(data.v2, exchangeName + "v2");
            const datav3 = (0, utils_1.toDictinary)(data.v3, exchangeName + "v3");
            const allPairsV2 = (0, utils_1.getPairIds)(data.v2);
            const allPairsV3 = (0, utils_1.getPairIds)(data.v3);
            //TODO: For now only t0_t1, but maybe need also check t1_t0 ?
            this.uniquePairs = (0, utils_1.distinct)(allPairsV2, allPairsV3, this.uniquePairs);
            this._db.set(exchangeName + "v2", datav2);
            this._db.set(exchangeName + "v3", datav3);
        }
        console.log("new data handled", "exchange:", exchangeName, "v2", data.v2.length, "v3", data.v3.length, "uniquePairs", this.uniquePairs.length);
        const entries = Array.from(this._db.entries());
        this.pairsToPools = (0, utils_1.pairToPools)(entries, this.uniquePairs);
        this._storage.init(this.pairsToPools);
    }
};
DexDataHandler = __decorate([
    (0, tsyringe_1.singleton)(),
    __metadata("design:paramtypes", [DexPairsRepository_1.DexPairsRepository])
], DexDataHandler);
exports.DexDataHandler = DexDataHandler;
