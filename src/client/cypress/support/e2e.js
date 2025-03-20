import { interceptApiCalls, loginAndResetState } from "../e2e/helpers/testHelpers";
import "cypress-file-upload";

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

for (const command of ["click", "type", "select", "check", "uncheck"]) {
  Cypress.Commands.overwrite(command, (originalFn, ...args) => {
    const result = originalFn(...args);
    return new Promise(resolve => {
      setTimeout(() => resolve(result), 100);
    });
  });
}

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});

let testFailures = [];

afterEach(function () {
  if (this.currentTest.state === "failed") {
    testFailures.push(this.currentTest.fullTitle());
  }
});

after(function () {
  if (testFailures.length > 0) {
    console.error(`Tests failed on at least one attempt: ${testFailures}`);
    throw new Error("One or more tests failed on at least one retry attempt.");
  }
});
