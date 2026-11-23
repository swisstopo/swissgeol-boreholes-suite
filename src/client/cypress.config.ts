import fs from "node:fs";
import { plugin as cypressGrepPlugin } from "@cypress/grep/plugin";
import { defineConfig } from "cypress";
import cypressSplit from "cypress-split";
import vitePreprocessor from "cypress-vite";
import { stackPorts } from "./worktree-slot.js";

export default defineConfig({
  projectId: "gv8yue",
  e2e: {
    baseUrl: `http://localhost:${stackPorts.client}`,
    video: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    supportFile: "cypress/support/e2e.ts",
    experimentalMemoryManagement: true,
    env: {
      grepFilterSpecs: true,
      grepOmitFiltered: true,
    },
    expose: {
      oidcOrigin: `http://localhost:${stackPorts.oidc}`,
    },

    setupNodeEvents(on, config) {
      cypressSplit(on, config);
      cypressGrepPlugin(config);
      on("file:preprocessor", vitePreprocessor());

      on("task", {
        log(message) {
          console.log(message);

          return null;
        },
        fileExistsInDownloadFolder(filename: string) {
          return fs.existsSync(filename);
        },
      });

      on("before:browser:launch", (browser, launchOptions) => {
        //Optimize test execution for electron
        if (browser.name === "electron") {
          launchOptions.preferences = {
            ...launchOptions.preferences,
            webPreferences: {
              ...(launchOptions.preferences?.webPreferences as object | undefined),
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
  includeShadowDom: true,
});
