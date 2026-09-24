/* global process */
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import { defineConfig } from "vitest/config";
import { devBranchPlugin } from "./vite-plugin-dev-branch.js";

const proxy = {
  "/api": {
    target: process.env.VITE_APP_PROXY_HOST_API || "http://127.0.0.1:5000/",
    changeOrigin: true,
  },
  "/dataextraction": {
    target: process.env.VITE_APP_PROXY_HOST_DATAEXTRACTION || "http://127.0.0.1:8000/",
    changeOrigin: true,
    rewrite: path => path.replace(/^\/dataextraction/, ""),
  },
  "/ocr": {
    target: process.env.VITE_APP_PROXY_HOST_OCR || "http://127.0.0.1:5052/",
    changeOrigin: true,
    rewrite: path => path.replace(/^\/ocr/, ""),
  },
};

export default defineConfig({
  base: "/",
  plugins: [
    react(),
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
  resolve: {
    tsconfigPaths: true,
  },
  server: {
    proxy,
    port: 3000,
    headers: {
      "Content-Security-Policy":
        // worker-src allows blob:, because the archive import reads the ZIP through a worker the
        // library starts from a blob URL. Without it the work falls back onto the main thread and
        // a large archive freezes the page, cancel button included.
        "default-src 'self'; connect-src 'self' https://*.geo.admin.ch http://localhost:4011; script-src 'self' 'unsafe-inline'; worker-src 'self' blob:; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' https://*.geo.admin.ch data: blob:; font-src 'self' data: fonts.gstatic.com; frame-ancestors 'none'",
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
