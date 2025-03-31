import { showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import { setInput, setYesNoSelect } from "../helpers/formHelpers.js";
import {
  createBorehole,
  createLithologyLayer,
  createStratigraphy,
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Search filter tests", () => {
  it.skip("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Filters");
  });

  it.skip("checks that the registration filter settings control the filter visibility.", () => {
    // precondition filters not visible
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Show all fields")
      .next()
      .within(() => {
        cy.contains("Created by").should("not.exist");
        cy.contains("Creation date").should("not.exist");
      });

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
      "extended.original_name": "Borehole 1 with striae: true",
      "custom.alternate_name": "striae true / null",
      national_interest: false,
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
      "extended.original_name": "Borehole 1 with striae: false",
      "custom.alternate_name": "striae false / null",
      national_interest: false,
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
      "extended.original_name": "Borehole 2 with striae: false",
      "custom.alternate_name": "striae false / null",
      national_interest: false,
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
      "extended.original_name": "Borehole 3 with striae: false",
      "custom.alternate_name": "striae false, national_interest null",
      national_interest: null,
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
    verifyPaginationText("1–1 of 1");
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
    verifyPaginationText("1–2 of 2");
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
    createBorehole({ "extended.original_name": "Filter by status" }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      goToRouteAndAcceptTerms(`/${id}/status`);
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

    const boreholeStatusDropdown = () => cy.contains("h6", "Borehole status").next();
    boreholeStatusDropdown().click();
    boreholeStatusDropdown()
      .find("div[role='option']")
      .then(options => {
        cy.wrap(options).contains("decayed").click({ force: true });
      });
    cy.wait("@edit_list");

    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "169");
    cy.get('[data-cy="filter-chip-boreholestatus"]').contains("Borehole status");
  });

  it("filters boreholes by color and uscs3", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Lithology").click();
    getElementByDataCy("show-all-fields-switch").click();
    const colorDropdown = () => cy.contains("h6", "Colour").next();
    colorDropdown().click();
    colorDropdown()
      .find("div[role='option']")
      .should("have.length", 25)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("beige");
      })
      .then(options => {
        cy.wrap(options).contains("beige").click({ force: true });
      });

    cy.wait("@edit_list");
    showTableAndWaitForData();
    verifyPaginationText("1–100 of 770");

    const uscs3Dropdown = () => cy.contains("h6", "USCS 3").next();
    uscs3Dropdown().scrollIntoView().click({ force: true });
    uscs3Dropdown()
      .find("div[role='option']")
      .should("have.length", 36)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[2]).to.have.text("lean clay");
      })
      .then(options => {
        cy.wrap(options).contains("gravel").click({ force: true });
      });

    cy.wait("@edit_list");

    // check content of table
    verifyPaginationText("1–100 of 108");
    cy.get(".MuiDataGrid-row").contains("Bruce Rempel").should("exist");
  });

  function filterByOriginalLithology() {
    cy.contains("Lithology").click();
    getElementByDataCy("show-all-fields-switch").click();
    cy.contains("Original lithology").next().find("input").type("Wooden Chair");
  }

  it("filters boreholes by original lithology in editor mode", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    filterByOriginalLithology();
    cy.wait("@edit_list");
    showTableAndWaitForData();
    verifyPaginationText("1–21 of 21");
  });

  it("filters boreholes by creation date", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    cy.contains("Registration").click();
    getElementByDataCy("show-all-fields-switch").click();

    // input values
    cy.contains("Creation date").next().find(".react-datepicker-wrapper .datepicker-input").click();

    cy.get(".react-datepicker__year-select").select("2021");
    cy.get(".react-datepicker__month-select").select("November");
    cy.get(".react-datepicker__day--009").click();

    cy.wait("@edit_list");

    cy.contains("Creation date").parent().parent().next().find(".react-datepicker-wrapper .datepicker-input").click();

    cy.get(".react-datepicker__year-select").select("2021");
    cy.get(".react-datepicker__month-select").select("November");
    cy.get(".react-datepicker__day--010").click();

    cy.wait("@edit_list");

    // check content of table
    showTableAndWaitForData();
    verifyPaginationText("1–3 of 3");
  });

  it("filters boreholes by workgroup", () => {
    goToRouteAndAcceptTerms("/");
    getElementByDataCy("show-filter-button").click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.contains("Name").click();
    cy.wait("@borehole");
  });
});
