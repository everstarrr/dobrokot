import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { config } from "./config";
import { errorHandler } from "./middleware/errorHandler";
import { router } from "./routes";
import { prisma } from "./lib/prisma";

const app: Express = express();

// Middleware
app.use(helmet());

const allowedOrigins = new Set(
  config.corsOrigin.split(",").map((value) => value.trim()).filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      // In dev allow any localhost port (3000, 3001, 3002, …) for convenience
      if (
        config.nodeEnv !== "production" &&
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);
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

    const server = app.listen(config.port, () => {
      console.log(`✓ Server running on port ${config.port}`);
    });

    // Graceful shutdown so `tsx watch` reloads (and prod SIGTERM) release the
    // Prisma connection pool — otherwise old "Sleep" sessions linger on MySQL
    // and starve the connection limit, surfacing as intermittent pool timeouts.
    const shutdown = async (signal: NodeJS.Signals) => {
      console.log(`Received ${signal}, shutting down...`);
      server.close();
      await prisma.$disconnect().catch(() => {});
      process.exit(0);
    };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
    process.once("SIGUSR2", shutdown); // tsx watch sends SIGUSR2 on reload
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

main();

export default app;
