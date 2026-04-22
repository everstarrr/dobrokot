import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@dobrokot/shared"],
  output: process.platform === "win32" ? undefined : "standalone",
};

export default nextConfig;
