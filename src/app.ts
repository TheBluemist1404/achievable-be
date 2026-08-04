import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

import { corsOptions } from "./config/cors";
import { clientRouter } from "./routes/server.route";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors(corsOptions));

/* ---------- Example Route ---------- */
app.get('/', (_req: Request, res: Response) => {
  res.send('🚀 Hello from Express + TypeScript!');
});

/* ---------- Health Check ---------- */
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ status: "ok" });
});

clientRouter(app);

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

export default app;
