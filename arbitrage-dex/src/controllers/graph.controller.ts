import { Request, Response, Router, NextFunction } from "express";
import { DexPairsRepository } from "../graph/DexPairsRepository";
import AppRoute from "./AppRoute";
import { autoInjectable } from "tsyringe";

@autoInjectable()
export default class GraphController implements AppRoute {
  route: string = "/graph";
  router: Router = Router();
  private _repository: DexPairsRepository;
  constructor(repository_: DexPairsRepository) {
    this.router.get("/", this.getData);
    this._repository = repository_;
  }
  getData(request: Request, response: Response, next: NextFunction) {
    throw new Error("Method not implemented.");
  }
}
