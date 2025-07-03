import { hasPagination, showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import { evaluateSelect, setInput, setSelect, setYesNoSelect } from "../helpers/formHelpers.js";
import {
  createBorehole,
  createLithologyLayer,
  createStratigraphy,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Search filter tests", () => {
  it("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Filters");
  });

  it("checks that the registration filter settings control the filter visibility.", () => {
    // precondition filters not visible
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Show all fields");
    cy.contains("Created by").should("not.exist");
    cy.contains("Creation date").should("not.exist");

    // turn on registration filters
    getElementByDataCy("settings-button").click();
    getElementByDataCy("general-tab").click();
    cy.contains("Registration filters").click();
    cy.contains("Select all").click();
    cy.wait("@setting");

    // check visibility of filters
    returnToOverview();
    getElementByDataCy("show-filter-button").click();
    cy.contains("Registration").click();
    cy.contains("Created by");
    cy.contains("Creation date");

    // reset setting
    getElementByDataCy("settings-button").click();
    getElementByDataCy("general-tab").click();
    cy.contains("Registration filters").click();
    cy.contains("Unselect all").click();
    cy.wait("@setting");
  });

  it("filters boreholes by creator name", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Registration").click();
    getElementByDataCy("show-all-fields-switch").click();

    // input value
    setInput("created_by", "v_ U%r");
    cy.wait("@edit_list");

    // check content of table
    showTableAndWaitForData();
    verifyPaginationText("1–100 of 329");
  });

  it("filters boreholes national_interest and striae", () => {
    createBorehole({
      originalName: "Borehole 1 with striae: true",
      name: "striae true / null",
      nationalInterest: false,
    })
      .as("borehole_id")
      .then(boreholeId => {
        createStratigraphy(boreholeId, 3000)
          .as("stratigraphy_id")
          .then(id => {
            createLithologyLayer(id, { isStriae: null });
            createLithologyLayer(id, { isStriae: true });
          });
      });

    createBorehole({
      originalName: "Borehole 1 with striae: false",
      name: "striae false / null",
      nationalInterest: false,
    })
      .as("borehole_id2")
      .then(boreholeId2 => {
        createStratigraphy(boreholeId2, 3000)
          .as("stratigraphy_id")
          .then(id => {
            createLithologyLayer(id, { isStriae: false });
            createLithologyLayer(id, { isStriae: null });
          });
      });

    createBorehole({
      originalName: "Borehole 2 with striae: false",
      name: "striae false / null",
      nationalInterest: false,
    })
      .as("borehole_id3")
      .then(boreholeId3 => {
        createStratigraphy(boreholeId3, 3000)
          .as("stratigraphy_id")
          .then(id => {
            createLithologyLayer(id, { isStriae: false });
          });
      });

    createBorehole({
      originalName: "Borehole 3 with striae: false",
      name: "striae false, national_interest null",
      nationalInterest: null,
    })
      .as("borehole_id3")
      .then(boreholeId3 => {
        createStratigraphy(boreholeId3, 3000)
          .as("stratigraphy_id")
          .then(id => {
            createLithologyLayer(id, { isStriae: false });
          });
      });

    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Location").click();
    getElementByDataCy("show-all-fields-switch").click();
    setYesNoSelect("national_interest", "Yes");
    cy.wait("@edit_list");

    showTableAndWaitForData();
    verifyPaginationText("1–100 of 160");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    setYesNoSelect("national_interest", "Not specified");
    cy.wait("@edit_list");
    hasPagination(false);
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    setYesNoSelect("national_interest", "No");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1469");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    cy.contains("Lithology").click();
    getElementByDataCy("show-all-fields-switch").click();
    setYesNoSelect("striae", "Yes");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1401");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    setYesNoSelect("striae", "No");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1402");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    setYesNoSelect("striae", "Not Specified");
    cy.wait("@edit_list");
    hasPagination(false);
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    // reset national interest filter
    cy.get('[data-cy="filter-chip-national_interest"]')
      .should("exist")
      .within(() => {
        cy.get("svg").click();
      });

    cy.wait("@edit_list");
    cy.get('[data-cy="filter-chip-national_interest"]').should("not.exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    setYesNoSelect("striae", "No");
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1555");
    cy.get('[data-cy="filter-chip-national_interest"]').should("not.exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    // reset striae filter
    cy.get('[data-cy="filter-chip-striae"]')
      .should("exist")
      .within(() => {
        cy.get("svg").click();
      });

    cy.get('[data-cy="filter-chip-national_interest"]').should("not.exist");
    cy.get('[data-cy="filter-chip-striae"]').should("not.exist");
    verifyPaginationText("1–100 of 1630");
  });

  it("filters boreholes by status", () => {
    createBorehole({ originalName: "Filter by status" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}/status`);
      startBoreholeEditing();
      getElementByDataCy("workflow_submit").click();
      getElementByDataCy("workflow_dialog_submit").click();
      returnToOverview();
      getElementByDataCy("show-filter-button").click();
      cy.contains("Status").click();
      getElementByDataCy("boreholes-number-preview").should("have.text", "1'627");
      getElementByDataCy("statuseditor").click();
      getElementByDataCy("boreholes-number-preview").should("have.text", "1'626");
      getElementByDataCy("statuscontroller").click();
      getElementByDataCy("boreholes-number-preview").should("have.text", "1");
    });
  });

  it("filters boreholes by boreholestatus", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Borehole").click();
    getElementByDataCy("show-all-fields-switch").click();
    setSelect("status", 2);
    cy.wait("@edit_list");

    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "169");
    cy.get('[data-cy="filter-chip-boreholestatus"]').contains("Borehole status");
  });

  it("filters boreholes by color and uscs3", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Lithology").click();
    getElementByDataCy("show-all-fields-switch").click();
    setSelect("color", 0);
    cy.wait("@edit_list");
    showTableAndWaitForData();
    verifyPaginationText("1–100 of 770");
    setSelect("uscs_3", 4);
    cy.wait("@edit_list");

    // check content of table
    verifyPaginationText("1–100 of 108");
    cy.get(".MuiDataGrid-row").contains("Bruce Rempel").should("exist");
  });

  it("filters boreholes by original lithology in editor mode", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Lithology").click();
    getElementByDataCy("show-all-fields-switch").click();
    setInput("original_lithology", "Wooden Chair");
    cy.wait("@edit_list");
    showTableAndWaitForData();
    hasPagination(false);
  });

  it("filters boreholes by creation date", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Registration").click();
    getElementByDataCy("show-all-fields-switch").click();

    setInput("created_date_from", "2021-11-09");
    cy.wait("@edit_list");
    setInput("created_date_to", "2021-11-10");

    cy.wait("@edit_list");

    // check content of table
    showTableAndWaitForData();
    hasPagination(false);
  });

  it("filters boreholes by workgroup", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.wait("@borehole");
    getElementByDataCy("filter-chip-workgroup").should("not.exist");
    getElementByDataCy("Default").click();
    getElementByDataCy("filter-chip-workgroup").should("exist");
    getElementByDataCy("all").click();
    getElementByDataCy("filter-chip-workgroup").should("not.exist");
  });

  it("shows additional values in domain filter", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Location").click();
    getElementByDataCy("show-all-fields-switch").click();
    setSelect("borehole_identifier", 0);
    evaluateSelect("borehole_identifier", "Boreholes.swissgeol.ch ID");
  });
});
