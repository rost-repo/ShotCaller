import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    outputFileTracingIncludes: {
        "/api/today": ["./data/players/**", "./public/data/index.json"],
        "/api/guess": ["./public/data/index.json"],
    },
};

export default nextConfig;