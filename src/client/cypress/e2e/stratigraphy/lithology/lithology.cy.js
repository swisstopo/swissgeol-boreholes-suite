import { saveForm } from "../../helpers/buttonHelpers.js";
import { setInput } from "../../helpers/formHelpers.js";

describe("Lithology, Lithology descriptions, facies descriptions", () => {
  it("adds and displays facies Descriptions", () => {
    cy.visit("1002670/stratigraphy");
    cy.dataCy("ddemptystratigraphy-button").click();
    setInput("name", "New Stratigraphy Name");
    saveForm();
    cy.dataCy("add-row-button").click();
    setInput("fromDepth", 1);
    setInput("toDepth", 134);
    cy.get("#«r24n»-option-2").click();
    cy.get("#«r283»").click();
    cy.get("#«r283»-option-5").click();
    cy.get("#«r24s»").click();
    cy.get("#«r24s»-option-2").click();
    cy.get("[data-cy='close-button']").click();
    cy.get("div.css-1xnfee8-MuiStack-root > div:nth-of-type(3) div.css-7owdng-MuiStack-root svg").click();
    cy.get("#«r28v»").click();
    cy.get("#«r28v»").type("L");
    cy.get("#«r28v»").type("Litho beschreibung");
    cy.get("[data-cy='close-button']").click();
    cy.get("div:nth-of-type(4) button").click();
    cy.get("#«r29e»").click();
    cy.get("#«r29e»-option-7").click();
    cy.get("#«r29j»").click();
    cy.get("#«r29j»").type("F");
    cy.get("#«r29j»").type("Fzielle B");
    cy.get("#«r29j»").type("Fzielle Beschribung");
    cy.get("[data-cy='close-button']").click();
    cy.get("[data-cy='save-button']").click();
    cy.get("[data-cy='editingstop-button']").click();
  });
});
