"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DexPairsRepository = void 0;
const tsyringe_1 = require("tsyringe");
let DexPairsRepository = class DexPairsRepository {
    constructor() {
        this.pairsToPools = new Map();
    }
    get(pairIds) {
        const result = new Map();
        for (const pairId of pairIds) {
            if (this.pairsToPools.has(pairId)) {
                const poolInfoArray = this.pairsToPools.get(pairId);
                result.set(pairId, poolInfoArray);
            }
        }
        return result;
    }
    init(data) {
        this.pairsToPools = data;
        // const e = await Fs.writeAsync(
        //   "./pairsToPools.json",
        //   Array.from(pairsToPools.entries())
        // );
    }
};
DexPairsRepository = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.injectable)()
], DexPairsRepository);
exports.DexPairsRepository = DexPairsRepository;
