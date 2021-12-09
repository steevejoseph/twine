import { home } from "../controllers/index";
import { Route } from "../../types";

export const routes: Route[] = [
  {
    method: "get",
    path: "/",
    middleware: [],
    handler: home,
  },
];