"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
class GraphController {
    constructor(repository_) {
        this.route = "/graph";
        this.router = (0, express_1.Router)();
        this.router.get("/", this.getData);
        this._repository = repository_;
    }
    getData(request, response, next) {
        throw new Error("Method not implemented.");
    }
}
exports.default = GraphController;
class AppRouting {
    constructor(route, repository) {
        this.route = route;
        this.repository = repository;
        this.route = route;
        this.repository = repository;
    }
    configure() {
        this.addRoute(new GraphController(this.repository));
    }
    addRoute(appRoute) {
        this.route.use(appRoute.route, appRoute.router);
    }
}
