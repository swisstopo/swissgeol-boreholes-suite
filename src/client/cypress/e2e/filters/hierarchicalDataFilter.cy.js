import { evaluateSelectText, setSelect } from "../helpers/formHelpers.js";
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
    cy.contains("label", "Period").next().click();
    cy.get(".MuiMenuItem-root")
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
      { period: "eon", value: "Phanerozoic" },
      { period: "era", value: "Cenozoic" },
      { period: "period", value: "Neogene" },
      { period: "epoch", value: "Miocene" },
      { period: "subepoch", value: "Early Miocene" },
      { period: "age", value: "Burdigalian" },
      { period: "subage", value: "late Burdigalian" },
    ];
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Chronostratigraphy").click();
    setSelect("subage", 1); //  "late Burdigalian",
    cy.wait(["@edit_list", "@borehole_geojson"]);
    filterValues.forEach(filter => {
      evaluateSelectText(filter.period, filter.value);
    });

    // Reset age select
    setSelect("age", 0);
    cy.wait(["@edit_list", "@borehole_geojson"]);

    let reducedFilterValues = filterValues.slice(0, filterValues.length - 2);
    // Verify that 2 levels are removed
    reducedFilterValues.forEach(filter => {
      evaluateSelectText(filter.period, filter.value);
    });

    // Reset period select
    setSelect("period", 0);
    cy.wait(["@edit_list", "@borehole_geojson"]);

    reducedFilterValues = filterValues.slice(0, filterValues.length - 4);
    // Verify that 4 levels are removed
    reducedFilterValues.forEach(filter => {
      evaluateSelectText(filter.period, filter.value);
    });
    // Reset all filters and verify they're cleared
    cy.contains("button", "Reset").click();
    cy.wait("@edit_list");
    filterValues.forEach(filter => {
      evaluateSelectText(filter.period, null);
    });
  });
});
