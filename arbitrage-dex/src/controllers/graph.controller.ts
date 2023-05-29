import { Request, Response, Router, NextFunction } from "express";
import { DexPairsRepositoryMemory } from "../graph/DexPairsRepositoryMemory";
import AppRoute from "./AppRoute";
import { Lifecycle, autoInjectable, container, scoped } from "tsyringe";
import { query, body, matchedData, validationResult } from "express-validator";
import { AppLogger } from "../utils/App.logger";
import { ChainGraphDexExecutor } from "../graph/inner/ChainGraphDexExecutor";

@autoInjectable()
export default class GraphController implements AppRoute {
  route: string = "/graph";
  router: Router = Router();
  repository: DexPairsRepositoryMemory;
  executor = new ChainGraphDexExecutor();
  constructor(repository: DexPairsRepositoryMemory) {
    this.repository = repository;

    this.router.post(
      "/",
      body("pairs").exists().withMessage("required"),
      (req, res, next) => this.getPairDataIds(req, res, next)
    );
    this.router.post(
      "/chain",
      query("chain").exists().withMessage("required"),
      body("pairs").exists().withMessage("required"),
      (req, res, next) => this.getPairsData(req, res, next)
    );
    this.router.get("", (req, res, next) => this.getStats(req, res, next));
    this.router.get("pairs", (req, res, next) =>
      this.getPairIds(req, res, next)
    );

    // AppLogger.info(`GraphController ctor`);
  }

  getPairDataIds(request: Request, response: Response, next: NextFunction) {
    const result = validationResult(request);
    if (!result.isEmpty()) response.send(result.array());
    const tokenIds: any = request.body;
    const data = this.repository.getPairIds(tokenIds.pairs);
    response.json(Array.from(data.entries()));
  }
  getPairIds(request: Request, response: Response, next: NextFunction) {
    const chain: any = request.query.chain;
    const chainPairs = this.repository.getPairs(chain);
    response.json(chainPairs);
  }

  getStats(request: Request, response: Response, next: NextFunction) {
    const data = this.repository.getStats();
    response.json(data);
  }

  getPairsData(request: Request, response: Response, next: NextFunction) {
    const result = validationResult(request);
    if (!result.isEmpty()) response.send(result.array());
    const chain: any = request.query.chain;
    const tokenIds: any = request.body;
    debugger;
  }
}
