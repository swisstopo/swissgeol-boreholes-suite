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
    experimentalMemoryManagement: true,

    setupNodeEvents(on, config) {
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
        //Optimize test execution for electron
        if (browser.name === "electron") {
          launchOptions.env = launchOptions.env || {};
          launchOptions.env.NODE_OPTIONS = "--max-old-space-size=4096";

          launchOptions.preferences = {
            ...(launchOptions.preferences || {}),
            webPreferences: {
              ...(launchOptions.preferences?.webPreferences || {}),
              backgroundThrottling: false,
              nodeIntegration: true,
              contextIsolation: false,
            },
          };
        }

        launchOptions.preferences.width = 1920;
        launchOptions.preferences.height = 1080;
        launchOptions.preferences.frame = false;
        launchOptions.preferences.useContentSize = true;

        return launchOptions;
      });

      return config;
    },
    retries: {
      runMode: 3,
      openMode: 0,
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
  numTestsKeptInMemory: 10,
  chromeWebSecurity: false,
});
