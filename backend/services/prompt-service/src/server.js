import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "..", ".env") });
import express from "express";
import cors from "cors";
import morgan from "morgan";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { connectMongo } from "./db/mongo.js";
import promptsRoutes from "./routes/prompts.js";

const PORT = process.env.PORT ?? 5002;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = CORS_ORIGIN.includes(",")
  ? CORS_ORIGIN.split(",").map((o) => o.trim()).filter(Boolean)
  : [CORS_ORIGIN];

const app = express();

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (!isProd || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("CORS origin not allowed"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(express.json({ limit: "512kb" }));
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 400,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use("/api/prompts", promptsRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "prompt-service" });
});

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`[prompt-service] Listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[prompt-service] Failed to start:", err);
  process.exit(1);
});
