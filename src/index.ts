import express from "express";
import { env } from "../env.mjs";
import cors from "cors";
import http from "http";
import { loggerMiddleware } from "./middlewares/logger";
import routes from "./routes"

const app = express();
const server = http.createServer(app);

//Express Body Middleware
app.use(express.json());
app.use(cors())
app.use(loggerMiddleware)

app.use(routes)

server.listen(env.PORT, () => {
  console.log("Server is running on http://localhost:" + env.PORT);
});
