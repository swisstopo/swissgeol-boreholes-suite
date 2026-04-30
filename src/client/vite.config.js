import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

const proxy = {
  "/api": {
    target: "http://127.0.0.1:5000/",
    changeOrigin: true,
  },
  "/dataextraction": {
    target: "http://127.0.0.1:8000/",
    changeOrigin: true,
    rewrite: path => path.replace(/^\/dataextraction/, ""),
  },
  "/ocr": {
    target: "http://127.0.0.1:5052/",
    changeOrigin: true,
    rewrite: path => path.replace(/^\/ocr/, ""),
  },
};

export default defineConfig({
  base: "/",
  // Preserve class/function names in the production bundle so Cypress assertions
  // against `constructor.name` (e.g. OpenLayers ImageLayer / DragBox) keep matching.
  esbuild: {
    keepNames: true,
  },
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
  ],
  server: {
    proxy,
    port: 3000,
    headers: {
      "Content-Security-Policy":
        "default-src 'self'; connect-src 'self' https://*.geo.admin.ch http://localhost:4011; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' https://*.geo.admin.ch data: blob:; font-src 'self' data: fonts.gstatic.com; frame-ancestors 'none'",
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
