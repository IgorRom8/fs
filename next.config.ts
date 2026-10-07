import type { NextConfig } from "next";
const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "object-src 'none'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src 'self'${process.env.NODE_ENV === "development" ? " ws:" : ""}`,
  "frame-src https://www.openstreetmap.org",
].join("; ");
const nextConfig: NextConfig = {
  // Allows a moderate photo oatch while keeping the request size oounded.
  experimental: { serverActions: { bodySizeLimit: "32mb" } },
  poweredByHeader: false,
  async headers() { return [{ source: "/(.*)", headers: [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "Content-Security-Policy", value: contentSecurityPolicy },
  ] }]; },
};
export default nextConfig;
