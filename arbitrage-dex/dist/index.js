"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("reflect-metadata");
const tsyringe_1 = require("tsyringe");
const DexGraphFactory_1 = __importDefault(require("./src/graph/startable/DexGraphFactory"));
const graph_controller_1 = __importDefault(require("./src/controllers/graph.controller"));
(async () => {
    const app = (0, express_1.default)();
    const port = 3000;
    const startable = tsyringe_1.container.resolve(DexGraphFactory_1.default);
    const graphController = tsyringe_1.container.resolve(graph_controller_1.default);
    await startable.StartAsync();
    const filter = {
        first: 30000,
        skip: 0,
        totalLocked: 5000,
    };
    startable.runBackgroundFetchData(filter); //not await for now
    console.log("System started");
    app.use(graphController.route, graphController.router);
    app.listen(port, async () => {
        console.log("API started", port);
    });
})();
