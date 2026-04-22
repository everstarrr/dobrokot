import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const envPaths = Array.from(
  new Set([
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), "../../.env"),
    path.resolve(__dirname, "../../.env"),
    path.resolve(__dirname, "../../../../.env"),
  ]),
);

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    dotenv.config({ path: envPath, override: false, quiet: true });
  }
}
