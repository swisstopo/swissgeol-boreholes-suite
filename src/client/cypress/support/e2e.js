import { interceptApiCalls, loginAndResetBoreholes } from "../e2e/testHelpers";

beforeEach(() => {
  interceptApiCalls();
  loginAndResetBoreholes();
});
