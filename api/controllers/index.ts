import { Handler } from "../../types";

/* GET home page. */
export const home: Handler = (req, res) => {
  res.send("hello");
}
