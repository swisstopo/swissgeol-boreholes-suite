const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "tzrzii",
  e2e: {
    baseUrl: "http://localhost:3000",
    video: false,
    viewportWidth: 1920,
    viewportHeight: 1080,
    supportFile: "cypress/support/e2e.js",
    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);

          return null;
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
  defaultCommandTimeout: 10000,
});
