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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tsyringe_1 = require("tsyringe");
const DexesConfig_1 = __importDefault(require("../inner/DexesConfig"));
const DexGraphClient_1 = __importDefault(require("../inner/DexGraphClient"));
const DexDataHandler_1 = require("../DexDataHandler");
let DexGraphFactory = class DexGraphFactory {
    constructor(config_, handler_) {
        this.graphs = [];
        this.ready = false;
        this.config = config_;
        this.handler = handler_;
    }
    async StartAsync() {
        this.graphs = await Promise.all(this.config.DEX_TO_DOCS.map((dex) => {
            return DexGraphClient_1.default.Create(dex.name, dex.doc, dex.liveDoc);
        }));
        this.ready = true;
    }
    async runBackgroundFetchData(filter) {
        if (!this.ready)
            return Promise.reject("not started");
        await Promise.all(this.graphs.map((graph) => graph.subscribe(filter, (data) => {
            this.handler.handle(graph.dexName, data);
        })));
    }
};
DexGraphFactory = __decorate([
    (0, tsyringe_1.singleton)(),
    (0, tsyringe_1.autoInjectable)(),
    __metadata("design:paramtypes", [DexesConfig_1.default, DexDataHandler_1.DexDataHandler])
], DexGraphFactory);
exports.default = DexGraphFactory;
