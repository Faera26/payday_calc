import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  disable: process.env.NODE_ENV === "development",
  register: true,
  swDest: "public/sw.js",
  swSrc: "src/app/sw.ts",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default withSerwist(nextConfig);
