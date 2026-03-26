import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localModules = path.resolve(__dirname, "node_modules");

const nextConfig: NextConfig = {
  output: "export",
  webpack: (config) => {
    config.resolve.modules = [localModules, "node_modules"];
    return config;
  },
};

export default nextConfig;
