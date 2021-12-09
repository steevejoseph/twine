import "dotenv/config";
import express from "express";
import { routes } from "./api/routes/routes";
import cookieParser from "cookie-parser";
import path from "path";
import logger from "morgan";
import mongoose from "mongoose";

const app = express();
const PORT = process.env.PORT || 3000;

const { MONGO_ATLAS_USER, MONGO_ATLAS_PASS } = process.env;

mongoose.connect(
  `mongodb+srv://${MONGO_ATLAS_USER}:${MONGO_ATLAS_PASS}@cluster0.wdzws.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
);

mongoose.connection.on("open", (ref) =>
  console.log("Connected to mongo server.")
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

routes.forEach((route) => {
  const { method, path, middleware, handler } = route;
  app[method](path, ...middleware, handler);
});

app.listen(PORT, () => {
  console.log(`Express Typescript app @ http://localhost:${PORT}`);
});

export default app;
