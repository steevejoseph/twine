import { home } from "../controllers/index";
import { addUser } from "../controllers/users";
import { Route } from "../types";

export const routes: Route[] = [
  {
    method: "get",
    path: "/",
    middleware: [],
    handler: home,
  },
  {
    method: "post",
    path: "/users/new",
    middleware: [],
    handler: addUser,
  },
];
