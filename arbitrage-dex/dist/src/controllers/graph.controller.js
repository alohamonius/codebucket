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
const express_1 = require("express");
const DexPairsRepository_1 = require("../graph/DexPairsRepository");
const tsyringe_1 = require("tsyringe");
const express_validator_1 = require("express-validator");
let GraphController = class GraphController {
    constructor(repository_) {
        this.route = "/graph";
        this.router = (0, express_1.Router)();
        this.router.post("/", (0, express_validator_1.body)("pairs").exists().withMessage("required"), this.post);
        this._repository = repository_;
    }
    post(request, response, next) {
        const result = (0, express_validator_1.validationResult)(request);
        if (!result.isEmpty())
            return response.send(result.array());
        const tokenIds = request.body;
        const data = this._repository.get(tokenIds.pairs);
        response.send(data);
    }
};
GraphController = __decorate([
    (0, tsyringe_1.autoInjectable)()
    // @scoped(Lifecycle.ResolutionScoped)
    ,
    __metadata("design:paramtypes", [DexPairsRepository_1.DexPairsRepository])
], GraphController);
exports.default = GraphController;
