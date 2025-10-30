import "./commands.js";
import { interceptApiCalls, login, loginAndResetState } from "../e2e/helpers/testHelpers";
import "cypress-file-upload";
import { stopEditing } from "../e2e/helpers/buttonHelpers.js";

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

before(() => {
  // Makes sure that the Editor user is consistently overwritten with oidc-mock user Editor
  login("editor");
});

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});

const failFlakyTests = false; // Set this to true to fail test run if at least one test fails in one of the attempts.
let testFailures = [];

afterEach(function () {
  // Stop editing even if the test fails
  cy.get("body").then($body => {
    if ($body.find('[data-cy="editingstop-button"]').length > 0) {
      stopEditing();
      cy.get("body").then($updatedBody => {
        if ($updatedBody.find(`.MuiButton-contained[data-cy="discardchanges-button"]`).length > 0) {
          cy.get(`.MuiButton-contained[data-cy="discardchanges-button"]`).click();
        }
      });
      cy.wait("@update-borehole");
    }
  });
  if (this.currentTest.state === "failed") {
    testFailures.push(this.currentTest.fullTitle());
  }
});

after(function () {
  if (failFlakyTests && testFailures.length > 0) {
    console.error(`Tests failed on at least one attempt: ${testFailures}`);
    throw new Error("One or more tests failed on at least one retry attempt.");
  }
});
