import express, {
  ErrorRequestHandler,
  Express,
  Request,
  Response,
  Router,
} from "express";
import "reflect-metadata";
import * as compression from "compression";
import { json, urlencoded } from "body-parser";
import { Api } from "./src/utils/ApiHelper";
import { AppLogger } from "./app.logger";
import { AppRouting } from "./api.routing";

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
    this.errorHandler();
    new AppRouting(this.router);
  }

  private configureMiddleware() {
    this.app.use(json({ limit: "50mb" }));
    // this.app.use(compression());
    this.app.use(urlencoded({ limit: "50mb", extended: true }));
  }

  public addRoute(route: string, router: Router) {
    this.app.use(route, router);
  }
  private errorHandler() {
    this.app.use(
      (error: ErrorRequestHandler, request: Request, res: Response) => {
        if (request.body) {
          AppLogger.error("Payload", JSON.stringify(request.body));
        }
        AppLogger.error("Error", error);
        Api.serverError(request, res, error);
      }
    );

    this.app.use((request, res) => {
      Api.notFound(request, res);
    });
  }
}
