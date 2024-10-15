import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
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
    },
    port: 3000,
  },
});
