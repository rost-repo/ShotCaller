import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        "/api/game": ["./data/seasons/*/players/**", "./data/pools.json", "./public/data/seasons/*/index.json"],
        "/api/guess": ["./data/pools.json", "./public/data/seasons/*/index.json"],
    },
};

export default nextConfig;