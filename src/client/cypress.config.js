import fs from "fs";
import { defineConfig } from "cypress";
import vitePreprocessor from "cypress-vite";

export default defineConfig({
  projectId: "gv8yue",
  e2e: {
    baseUrl: "http://localhost:3000",
    video: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on) {
      on("file:preprocessor", vitePreprocessor());

      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
        fileExistsInDownloadFolder(filename) {
          return fs.existsSync(filename);
        },
      });

      on("before:browser:launch", (browser, launchOptions) => {
        launchOptions.preferences.width = 1920;
        launchOptions.preferences.height = 1080;
        launchOptions.preferences.frame = false;
        launchOptions.preferences.useContentSize = true;

        return launchOptions;
      });
    },
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
  defaultCommandTimeout: 10000,
  waitForAnimations: false,
  animationDistanceThreshold: 50,
  retries: 0,
});
