import { login } from "./testHelpers";

describe("Hierachical data filter tests", () => {
  it("check visible filters", () => {
    login("/editor");
    cy.contains("span", "Chronostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 7);
    cy.contains("span", "Lithostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 3);
  });

  it("check hierarchical filtering", () => {
    const filterValues = [
      "Phanerozoic",
      "Cenozoic",
      "Neogene",
      "Miocene",
      "Early Miocene",
      "Burdigalian",
      "late Burdigalian",
    ];
    login("/editor");
    cy.contains("span", "Chronostratigraphy").click();
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 1)
      .find("input")
      .type(filterValues[filterValues.length - 1] + "{enter}");
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]')
      .find("div.divider.text")
      .should("have.length", filterValues.length)
      .each((el, i) => {
        expect(el).to.have.text(filterValues[i]);
      });
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 2)
      .contains("label", "Reset")
      .click();
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]')
      .find("div.divider.text")
      .should("have.length", filterValues.length - 2)
      .each((el, i) => {
        expect(el).to.have.text(filterValues[i]);
      });
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 4)
      .find("div.dropdown")
      .click();
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 4)
      .find('[role="option"]')
      .first()
      .scrollIntoView()
      .click();
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]')
      .find("div.divider.text")
      .should("have.length", filterValues.length - 4)
      .each((el, i) => {
        expect(el).to.have.text(filterValues[i]);
      });
    cy.contains("a", "Reset").click();
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]')
      .find("div.divider.text")
      .should("have.length", 0);
  });
});
