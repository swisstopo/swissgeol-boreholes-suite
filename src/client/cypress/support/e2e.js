import { interceptApiCalls, loginAndResetState } from "../e2e/testHelpers";

beforeEach(() => {
  interceptApiCalls();
  loginAndResetState();
});

Cypress.on("uncaught:exception", (err, runnable) => {
  if (
    err.message.includes("Cannot read properties of undefined (reading 'NaN')")
  ) {
    return false;
  }
});
