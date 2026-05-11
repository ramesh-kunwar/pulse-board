import express, { Express } from "express";
import authRouter from "./module/auth/auth.routes.js";
import { errorHandler } from "./common/middleware/error.middleware.js";
import cookieParser from "cookie-parser";
const app: Express = express();

app.use(express.json());
app.use(cookieParser());

app.get("/ping", (req, res) => {
  res.send("Pong");
});

app.use("/api/auth", authRouter);

app.use(errorHandler);
export default app;
