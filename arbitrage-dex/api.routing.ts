import { Router } from "express";
import { container } from "tsyringe";
import GraphController from "./src/controllers/graph.controller";
import AppRoute from "./src/controllers/AppRoute";

export class AppRouting {
  constructor(private route: Router) {
    this.route = route;
    this.configure();
  }
  public configure() {
    const graphController = container.resolve(GraphController);
    this.addRoute(graphController);
  }

  private addRoute(appRoute: AppRoute) {
    this.route.use(appRoute.route, appRoute.router);
  }
}
