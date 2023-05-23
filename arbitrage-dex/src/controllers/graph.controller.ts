import { Request, Response, Router, NextFunction } from "express";
import { DexPairsRepository } from "../graph/DexPairsRepository";
import AppRoute from "./AppRoute";
import { Lifecycle, autoInjectable, container, scoped } from "tsyringe";
import { body, matchedData, validationResult } from "express-validator";
import { AppLogger } from "../utils/App.logger";

@autoInjectable()
export default class GraphController implements AppRoute {
  route: string = "/graph";
  router: Router = Router();
  repository: DexPairsRepository;
  constructor(repository: DexPairsRepository) {
    this.router.post(
      "/",
      body("pairs").exists().withMessage("required"),
      this.post
    );
    AppLogger.info(`GraphController ctor`);
    this.repository = repository;
  }

  post(request: Request, response: Response, next: NextFunction) {
    const result = validationResult(request);
    if (!result.isEmpty()) response.send(result.array());
    const tokenIds: any = request.body;

    const repo = container.resolve(DexPairsRepository); //todo:container remove, why ctor not works? antipatteern
    const data = repo.get(tokenIds.pairs);
    response.json(Array.from(data.entries()));
  }
}
