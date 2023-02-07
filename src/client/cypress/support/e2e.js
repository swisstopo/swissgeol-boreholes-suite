import { interceptApiCalls, loginAndResetState } from "../e2e/testHelpers";

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});

Cypress.on("uncaught:exception", () => {
  // do not automatically fail tests if an unrelated application error occurs
  return false;
});
