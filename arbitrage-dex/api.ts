import express, {
  Express,
  NextFunction,
  Request,
  Response,
  Router,
} from "express";
import "reflect-metadata";
import { AppLogger } from "./src/utils/App.logger";
import { container } from "tsyringe";
import GraphController from "./src/controllers/Graph.controller";

export default class ExpressApi {
  public app: Express;
  private router: Router;
  constructor() {
    this.app = express();
    this.router = Router();
    this.configure();
  }

  public run(port: number, onStart: any) {
    this.app.listen(port, onStart);
  }

  private configure() {
    this.configureMiddleware();
    this.configureRoutes();
    this.errorHandler();
  }
  private configureRoutes() {
    const graphController = container.resolve(GraphController);
    this.app.use(graphController.route, graphController.router);
  }

  private configureMiddleware() {
    this.app.use(express.json({ limit: "50mb" }));
    this.app.use(express.urlencoded({ limit: "50mb", extended: true }));
  }

  private errorHandler() {
    this.app.use(errorHandler);
  }
}

const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  AppLogger.error(err.message);

  return res.status(500).json({ error: "Internal server error" });
};
