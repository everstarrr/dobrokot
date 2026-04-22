import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import { defineConfig, env } from "prisma/config";

for (const envPath of [
  path.resolve(process.cwd(), ".env"),
  path.resolve(process.cwd(), "../../.env"),
  path.resolve(__dirname, ".env"),
  path.resolve(__dirname, "../../.env"),
]) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
