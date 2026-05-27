import "../config/env";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Prisma 7 uses the MariaDB adapter package for direct TCP connections to MySQL/MariaDB.
const adapter = new PrismaMariaDb(getMySqlConfig());

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function getMySqlConfig() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const parsedUrl = new URL(databaseUrl);
  if (parsedUrl.protocol !== "mysql:") {
    throw new Error(`Unsupported DATABASE_URL protocol: ${parsedUrl.protocol}`);
  }

  const query = parsedUrl.searchParams;
  const rawHost = process.env.DATABASE_HOST || parsedUrl.hostname;
  // On Windows, "localhost" resolves to IPv6 (::1) first; MySQL/MariaDB containers
  // and most local installs only listen on IPv4, leading to EACCES ::1:3306.
  // Pin to 127.0.0.1 so the driver opens IPv4 sockets.
  const host = rawHost === "localhost" ? "127.0.0.1" : rawHost;
  const isLocalDatabaseHost = ["localhost", "127.0.0.1", "::1", "mysql"].includes(host);
  const database = process.env.DATABASE_NAME || parsedUrl.pathname.replace(/^\//, "");
  if (!database) {
    throw new Error("DATABASE_NAME could not be resolved from DATABASE_URL");
  }

  return {
    host,
    port: parseInt(process.env.DATABASE_PORT || parsedUrl.port || "3306", 10),
    user: process.env.DATABASE_USER || decodeURIComponent(parsedUrl.username),
    password: process.env.DATABASE_PASSWORD || decodeURIComponent(parsedUrl.password),
    database,
    connectionLimit: parseInt(process.env.DATABASE_CONNECTION_LIMIT || "5", 10),
    acquireTimeout: parseInt(
      process.env.DATABASE_ACQUIRE_TIMEOUT ||
        query.get("acquireTimeout") ||
        "10000",
      10,
    ),
    // Cyrillic strings get stored as U+FFFD when the driver negotiates a non-UTF-8
    // collation (default behavior depends on server locale). Pin to utf8mb4.
    charset: "utf8mb4",
    collation: "utf8mb4_unicode_ci",
    allowPublicKeyRetrieval: parseBoolean(
      process.env.DATABASE_ALLOW_PUBLIC_KEY_RETRIEVAL ??
        query.get("allowPublicKeyRetrieval"),
      // Local MySQL 8 often requires public key retrieval when SSL is not configured.
      isLocalDatabaseHost,
    ),
    cachingRsaPublicKey:
      process.env.DATABASE_CACHING_RSA_PUBLIC_KEY ||
      query.get("cachingRsaPublicKey") ||
      undefined,
  };
}

function parseBoolean(value: string | null | undefined, fallback: boolean) {
  if (value == null || value === "") {
    return fallback;
  }

  return value === "1" || value.toLowerCase() === "true";
}
