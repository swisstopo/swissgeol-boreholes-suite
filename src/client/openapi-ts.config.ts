import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "./openapi/swagger.json",
  output: {
    path: "./src/api/generated",
    format: "prettier",
  },
  plugins: ["@hey-api/typescript"],
});
