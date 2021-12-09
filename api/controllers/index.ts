import path from "path";
import { Handler } from "../../types";

/* GET home page. */
export const home: Handler = (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
};
