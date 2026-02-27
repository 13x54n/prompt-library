import express from "express";
import cors from "cors";
import { connectMongo } from "./db/mongo.js";
import authRoutes from "./routes/auth.js";
import usersRoutes from "./routes/users.js";

const PORT = process.env.PORT ?? 5001;
const CORS_ORIGIN = process.env.CORS_ORIGIN ?? "http://localhost:3000";

const app = express();

app.use(
  cors({
    origin: CORS_ORIGIN.includes(",")
      ? CORS_ORIGIN.split(",").map((o) => o.trim())
      : CORS_ORIGIN,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "auth-service" });
});

async function start() {
  await connectMongo();
  app.listen(PORT, () => {
    console.log(`[auth-service] Listening on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("[auth-service] Failed to start:", err);
  process.exit(1);
});
