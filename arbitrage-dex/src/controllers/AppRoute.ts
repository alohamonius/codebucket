import { Router } from "express";

export default interface AppRoute {
  route: string;
  router: Router;
}
