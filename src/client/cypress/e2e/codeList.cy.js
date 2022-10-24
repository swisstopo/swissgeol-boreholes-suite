import adminUser from "../fixtures/adminUser.json";
import editorUser from "../fixtures/editorUser.json";
import { login } from "../e2e/testHelpers";

describe("Codelist translations tests", () => {
  it("Admin can open codelist translation section", () => {
    // Login and navigate to editor settings
    cy.intercept("/api/v1/user", adminUser);

    login();
    cy.get("div[id=map]").should("be.visible");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Editor").click();
    cy.get("button").should("not.contain", "Collapse");

    cy.contains("div", "Codelist translations")
      .parent("div")
      .children("div")
      .find("button")
      .click();

    cy.get("button").should("contain", "Collapse");
  });

  it("Admin can edit translations", () => {
    cy.intercept("/api/v1/user", adminUser);

    login();
    cy.get("div[id=map]").should("be.visible");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Editor").click();
    cy.contains("div", "Codelist translations")
      .parent("div")
      .children("div")
      .find("button")
      .click();

    cy.contains("p", "borehole_form").click();
    cy.get("div[name=borehole_form]").children().should("have.length", 38);
    cy.contains("p", "mcla107").click();
    cy.get("div[name=mcla107]").children().should("have.length", 6);

    // assure input fields are empty
    cy.get("input[name=german-input]").should("have.value", "");
    cy.get("input[name=french-input]").should("have.value", "");
    cy.get("input[name=italian-input]").should("have.value", "");
    cy.get("input[name=english-input]").should("have.value", "");

    // click on record.
    cy.contains("div", "Gerölle").click();

    // assure input fields are filled
    cy.get("input[name=german-input]").should("have.value", "Gerölle");
    cy.get("input[name=french-input]").should("have.value", "gravats");
    cy.get("input[name=italian-input]").should("have.value", "detriti");
    cy.get("input[name=english-input]").should("have.value", "rubble");

    // click on record again to reset
    cy.contains("div", "Gerölle").click();

    // assure input fields are empty
    cy.get("input[name=german-input]").should("have.value", "");
    cy.get("input[name=french-input]").should("have.value", "");
    cy.get("input[name=italian-input]").should("have.value", "");
    cy.get("input[name=english-input]").should("have.value", "");

    // click on different record.
    cy.contains("div", "Bohrzweck").click();

    // assure input fields are filled
    cy.get("input[name=german-input]").should("have.value", "Bohrzweck");
    cy.get("input[name=french-input]").should("have.value", "But du forage");
    cy.get("input[name=italian-input]").should(
      "have.value",
      "scopo perforazione",
    );
    cy.get("input[name=english-input]").should("have.value", "Purpose");

    // edit translation
    cy.get("input[name=german-input]").click().clear().type("Neuer Bohrzweck");
    cy.contains("button", "Save").click();

    // translation was updated
    cy.get("input[name=german-input]").should("have.value", "Neuer Bohrzweck");

    // undo edit translation
    cy.get("input[name=german-input]").click().clear().type("Bohrzweck");
    cy.contains("button", "Save").click();

    // translation was updated
    cy.get("input[name=german-input]").should("have.value", "Bohrzweck");
  });

  it("Editor cannot open codelist translation section", () => {
    // login as editor
    cy.intercept("/api/v1/user", editorUser);

    login();
    cy.get("div[id=map]").should("be.visible");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Editor").click();
    // Codelist translation section is not available
    cy.get("div").should("not.contain", "Codelist translations");
  });
});
