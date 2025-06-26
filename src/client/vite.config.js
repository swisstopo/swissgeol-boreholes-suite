import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import svgr from "vite-plugin-svgr";
import viteTsconfigPaths from "vite-tsconfig-paths";

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
          src: "node_modules/@swisstopo/swissgeol-ui-core/dist/swissgeol-ui-core/assets/*",
          dest: "assets",
        },
      ],
    }),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000/",
        changeOrigin: true,
      },
      "/dataextraction": {
        target: "http://localhost:8000/",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/dataextraction/, ""),
      },
      "/ocr": {
        target: "http://localhost:5052/",
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ocr/, ""),
      },
    },
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
});
