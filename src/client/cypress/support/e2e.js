import { interceptApiCalls, loginAndResetState } from "../e2e/testHelpers";

Cypress.on("uncaught:exception", () => {
  // returning false here prevents Cypress from
  // failing the test
  return false;
});

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});
