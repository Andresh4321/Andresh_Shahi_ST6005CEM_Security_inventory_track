import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    // Prevent Next.js/Turbopack from inferring the workspace root from other lockfiles
    // (e.g. a sibling/parent `package-lock.json`).
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
