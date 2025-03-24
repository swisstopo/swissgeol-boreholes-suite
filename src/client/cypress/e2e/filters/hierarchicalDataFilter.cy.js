import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Hierachical data filter tests", () => {
  it("check visible filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Chronostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 7);
    cy.contains("h6", "Lithostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 3);
  });

  it("check sorting of filter values", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Chronostratigraphy").click();
    const periodsDropdown = () => cy.contains("label", "Period").next();
    periodsDropdown().click();
    periodsDropdown()
      .find("div[role='option']")
      .should("have.length", 13)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("Quaternary");
        expect(options[2]).to.have.text("Neogene");
        expect(options[3]).to.have.text("Paleogene");
        expect(options[4]).to.have.text("Cretaceous");
        expect(options[5]).to.have.text("Jurassic");
        expect(options[6]).to.have.text("Triassic");
        expect(options[7]).to.have.text("Permian");
        expect(options[8]).to.have.text("Carboniferous");
        expect(options[9]).to.have.text("Devonian");
        expect(options[10]).to.have.text("Silurian");
        expect(options[11]).to.have.text("Ordovician");
        expect(options[12]).to.have.text("Cambrian");
      });
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
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Chronostratigraphy").click();
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
      .find("div.dropdown")
      .click();
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 2)
      .find('[role="option"]')
      .first()
      .scrollIntoView();
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 2)
      .find('[role="option"]')
      .first()
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
      .scrollIntoView();
    cy.get('[data-cy="hierarchical-data-search"]')
      .eq(filterValues.length - 4)
      .find('[role="option"]')
      .first()
      .click();
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]')
      .find("div.divider.text")
      .should("have.length", filterValues.length - 4)
      .each((el, i) => {
        expect(el).to.have.text(filterValues[i]);
      });
    cy.contains("button", "Reset").click();
    cy.wait("@edit_list");
    cy.get('[data-cy="hierarchical-data-search"]').find("div.divider.text").should("have.length", 0);
  });
});
