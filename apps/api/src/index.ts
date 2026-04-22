import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { router } from "./routes";
import { prisma } from "./lib/prisma";
import { redis } from "./lib/redis";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

// Routes
app.use("/api", router);

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start
async function main() {
  try {
    await prisma.$connect();
    console.log("✓ Database connected");

    await redis.connect();
    console.log("✓ Redis connected");

    app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

export default app;
