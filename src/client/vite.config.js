import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";
import { devBranchPlugin } from "./vite-plugin-dev-branch.js";

const apiPort = process.env.VITE_APP_API_PORT || "5000";
const dataextractionPort = process.env.VITE_APP_DATAEXTRACTION_PORT || "8000";
const ocrPort = process.env.VITE_APP_OCR_PORT || "5052";
const oidcPort = process.env.VITE_APP_OIDC_PORT || "4011";

const proxy = {
  "/api": {
    target: `http://127.0.0.1:${apiPort}/`,
    changeOrigin: true,
  },
  "/dataextraction": {
    target: `http://127.0.0.1:${dataextractionPort}/`,
    changeOrigin: true,
    rewrite: path => path.replace(/^\/dataextraction/, ""),
  },
  "/ocr": {
    target: `http://127.0.0.1:${ocrPort}/`,
    changeOrigin: true,
    rewrite: path => path.replace(/^\/ocr/, ""),
  },
};

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgr({
      include: "**/*.svg?react",
    }),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@swissgeol/ui-core/dist/swissgeol-ui-core/assets/*",
          dest: "assets",
        },
      ],
    }),
    devBranchPlugin(),
  ],
  server: {
    proxy,
    port: 3000,
    headers: {
      "Content-Security-Policy":
        `default-src 'self'; connect-src 'self' https://*.geo.admin.ch http://localhost:${oidcPort}; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' https://*.geo.admin.ch data: blob:; font-src 'self' data: fonts.gstatic.com; frame-ancestors 'none'`,
      "X-FRAME-OPTIONS": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    },
  },
  // Preview shares the dev port so CI's `wait-on: http://localhost:3000` works regardless of which is running.
  preview: {
    proxy,
    port: 3000,
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}"],
    environment: "node",
    globals: false,
  },
});
