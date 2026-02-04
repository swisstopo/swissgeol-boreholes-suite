import { evaluateDropdownOptionsLength, evaluateSelect, setSelect } from "../helpers/formHelpers.js";
import { goToRouteAndAcceptTerms } from "../helpers/testHelpers.js";

describe("Hierachical data filter tests", () => {
  // TODO: Reactivate tests when filter has been fixed
  it.skip("check visible filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("h6", "Chronostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 7);
    cy.contains("h6", "Lithostratigraphy").click();
    cy.get("Show all fields").should("not.exist");
    cy.get('[data-cy="hierarchical-data-search"]').should("have.length", 3);
    cy.dataCy("reset-filter-button").click();
  });

  it.skip("check sorting of filter values", () => {
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("h6", "Chronostratigraphy").click();
    cy.contains("label", "Period").next().click();
    evaluateDropdownOptionsLength(13);

    cy.get('.MuiPaper-elevation [role="listbox"]')
      .find('[role="option"]')
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

  it.skip("check hierarchical filtering", () => {
    let filterValues = [
      { period: "eon", value: "Phanerozoic" },
      { period: "era", value: "Cenozoic" },
      { period: "period", value: "Neogene" },
      { period: "epoch", value: "Miocene" },
      { period: "subepoch", value: "Early Miocene" },
      { period: "age", value: "Burdigalian" },
      { period: "subage", value: "late Burdigalian" },
    ];
    goToRouteAndAcceptTerms("/");
    cy.dataCy("show-filter-button").click();
    cy.contains("h6", "Chronostratigraphy").click();
    setSelect("subage", 1); //  "late Burdigalian",
    cy.wait(["@edit_list", "@borehole_geojson"]);
    cy.dataCy("filter-chip-chronostratigraphy_id").should("exist");
    cy.wrap(filterValues).each(filter => {
      return evaluateSelect(filter.period, filter.value);
    });
    cy.then(() => {
      // Reset age select
      setSelect("age", 0);
    });

    cy.wait(["@edit_list", "@borehole_geojson"]);
    cy.dataCy("filter-chip-chronostratigraphy_id").should("exist");

    filterValues = [
      { period: "eon", value: "Phanerozoic" },
      { period: "era", value: "Cenozoic" },
      { period: "period", value: "Neogene" },
      { period: "epoch", value: "Miocene" },
      { period: "subepoch", value: "Early Miocene" },
      { period: "age", value: "" },
      { period: "subage", value: "" },
    ];
    // Verify that 2 levels are removed
    cy.wrap(filterValues).each(filter => {
      return evaluateSelect(filter.period, filter.value);
    });
    cy.then(() => {
      // Reset period select
      setSelect("period", 0);
    });
    cy.wait(["@edit_list", "@borehole_geojson"]);
    cy.dataCy("filter-chip-chronostratigraphy_id").should("exist");

    filterValues = [
      { period: "eon", value: "Phanerozoic" },
      { period: "era", value: "Cenozoic" },
      { period: "period", value: "" },
      { period: "epoch", value: "" },
      { period: "subepoch", value: "" },
      { period: "age", value: "" },
      { period: "subage", value: "" },
    ];
    // Verify that 4 levels are removed
    cy.wrap(filterValues).each(filter => {
      return evaluateSelect(filter.period, filter.value);
    });
    cy.then(() => {
      // Reset all filters and verify they're cleared
      cy.contains("button", "Reset").click();
    });
    cy.wait("@edit_list");
    cy.dataCy("filter-chip-chronostratigraphy_id").should("not.exist");
    filterValues.forEach(filter => {
      evaluateSelect(filter.period, "");
    });
  });
});
