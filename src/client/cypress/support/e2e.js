import { interceptApiCalls, loginAndResetState } from "../e2e/helpers/testHelpers";

import "cypress-file-upload";

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});
