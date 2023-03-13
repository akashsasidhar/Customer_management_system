import bodyParser from "body-parser";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import user from "./routes/users.js";
const port = process.env.PORT || 5001;

const app = express();
app.use(cors());
app.use(helmet());
app.set("trust-proxy", 1);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
// parse application/json
app.use(bodyParser.json());
app.disable("etag"); //Disables caching
morgan.token("remote-addr", (req) => {
  return req.header("X-Real-IP") || req.ip;
});
app.use("/api/user", user);
app.listen(port, () => {
  console.log(`Server is running on this port ${port}`);
});
