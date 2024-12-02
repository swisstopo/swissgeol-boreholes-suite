import license from "../../fixtures/license.json";
import { loginAsAdmin, selectByDataCyAttribute, selectByDataCyAttributeStartingWith } from "../helpers/testHelpers";

describe("Admin about page tests", () => {
  it("shows version information linking the corresponding release on GitHub.", () => {
    loginAsAdmin("/setting/about");

    selectByDataCyAttribute("version")
      .should("contain", "0.0.99+dev")
      .should("have.attr", "href", "https://github.com/swisstopo/swissgeol-boreholes-suite/releases/tag/v0.0.99");
  });

  it("shows license information (with fixtures)", () => {
    cy.intercept("/license.json", license);
    loginAsAdmin("/setting/about");

    selectByDataCyAttributeStartingWith("credits-").should("have.length", 2);
    selectByDataCyAttribute("credits-example-js@0.0.999").should("contain", "example-js (Version 0.0.999)");
    selectByDataCyAttribute("credits-example-react@0.0.111").should("contain", "example-react (Version 0.0.111)");
  });

  it("shows license information (without fixtures)", () => {
    loginAsAdmin("/setting/about");
    selectByDataCyAttributeStartingWith("credits-").should("have.length.above", 0);
  });
});
