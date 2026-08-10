import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        "/api/today": ["./data/players/**", "./data/pools.json", "./public/data/index.json"],
        "/api/guess": ["./data/pools.json", "./public/data/index.json"],
    },
};

export default nextConfig;