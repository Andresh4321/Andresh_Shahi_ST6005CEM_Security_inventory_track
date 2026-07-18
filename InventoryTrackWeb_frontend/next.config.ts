import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Disable React Strict Mode to prevent double-mounting in development
  // (Strict Mode causes components to mount→unmount→remount, doubling API calls)
  reactStrictMode: false,

  // Allow Burp Suite browser (127.0.0.1) to access dev server without cross-origin warnings
  allowedDevOrigins: ['http://127.0.0.1:3000', 'http://localhost:3000', 'http://192.168.1.9:3000'],

  turbopack: {
    // Prevent Next.js/Turbopack from inferring the workspace root from other lockfiles
    // (e.g. a sibling/parent `package-lock.json`).
    root: path.resolve(__dirname),
  },

  // ========== SECURITY: Disable source maps in production ==========
  // Prevents exposing source code to end users in the browser DevTools
  productionBrowserSourceMaps: false,

  // ========== SECURITY HEADERS ==========
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Prevent clickjacking (SAMEORIGIN allows reCAPTCHA iframe)
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Prevent MIME type sniffing
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // XSS Protection
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          // Referrer Policy - don't leak full URL to external sites
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions Policy - restrict browser features
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          // Strict Transport Security (HTTPS enforcement)
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
        ],
      },
    ];
  },

  // Disable powered-by header
  poweredByHeader: false,
};

export default nextConfig;
