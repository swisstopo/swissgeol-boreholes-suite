import { showTableAndWaitForData, verifyPaginationText } from "../helpers/dataGridHelpers";
import {
  createBorehole,
  createLithologyLayer,
  createStratigraphy,
  goToRouteAndAcceptTerms,
  returnToOverview,
  startBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Search filter tests", () => {
  it("has search filters", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Filters");
  });

  it("shows the correct dropdowns", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("h6", "Location").click();
    cy.contains("Show all fields").children().eq(0).click();
    let indentifierDropdown = cy.contains("label", "ID type").next();

    indentifierDropdown.click();
    indentifierDropdown
      .find("div[role='option']")
      .should("have.length", 12)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("ID Original");
      });

    cy.contains("h6", "Borehole").click();
    let boreholeTypeDropdown = cy.contains("label", "Borehole type").next();

    boreholeTypeDropdown.click();
    boreholeTypeDropdown
      .find("div[role='option']")
      .should("have.length", 8)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("borehole");
        expect(options[2]).to.have.text("virtual borehole");
        expect(options[3]).to.have.text("penetration test");
        expect(options[4]).to.have.text("trial pit");
        expect(options[5]).to.have.text("outcrop");
        expect(options[6]).to.have.text("other");
        expect(options[7]).to.have.text("not specified");
      });
  });

  it("checks that the registration filter settings control the filter visibility.", () => {
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
    cy.get('[data-cy="settings-button"]').click();
    cy.contains("Registration filters").click();
    cy.contains("Select all").click();
    cy.wait("@setting");

    // check visibility of filters
    returnToOverview();
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Created by");
    cy.contains("Creation date");

    // reset setting
    cy.get('[data-cy="settings-button"]').click();
    cy.contains("Registration filters").click();
    cy.contains("Unselect all").click();
    cy.wait("@setting");
  });

  it("filters boreholes by creator name", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Show all fields").children(".checkbox").click();

    // input value
    cy.contains("Created by").next().find("input").type("v_ U%r");
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
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Location").click();
    cy.contains("Show all fields").children(".checkbox").click();

    cy.get('[data-cy="national_interest-yes"]').click();
    cy.wait("@edit_list");

    showTableAndWaitForData();
    verifyPaginationText("1–100 of 160");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    cy.get('[data-cy="national_interest-np"]').click();
    cy.wait("@edit_list");
    verifyPaginationText("1–1 of 1");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    cy.get('[data-cy="national_interest-no"]').click();
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1469");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");

    cy.contains("Lithology").click();
    cy.contains("Show all fields").children(".checkbox").click();
    cy.get('[data-cy="striae-yes"]').click();
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1401");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    cy.get('[data-cy="striae-no"]').click();
    cy.wait("@edit_list");
    verifyPaginationText("1–100 of 1402");
    cy.get('[data-cy="filter-chip-national_interest"]').should("exist");
    cy.get('[data-cy="filter-chip-striae"]').should("exist");

    cy.get('[data-cy="striae-np"]').click();
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

    cy.get('[data-cy="striae-no"]').click();
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
      cy.get('[data-cy="workflow_submit"]').click();
      cy.get('[data-cy="workflow_dialog_submit"]').click();
      returnToOverview();
      cy.get('[data-cy="show-filter-button"]').click();
      cy.contains("Status").click();
      cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'627");
      cy.get('[data-cy="statuseditor"]').click();
      cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1'626");
      cy.get('[data-cy="statuscontroller"]').click();
      cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "1");
    });
  });

  it("filters boreholes by boreholestatus", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Borehole").click();
    cy.contains("Show all fields").children(".checkbox").click();

    let boreholeStatusDropdown = cy.contains("label", "Borehole status").next();

    boreholeStatusDropdown.click();
    boreholeStatusDropdown.find("div[role='option']").then(options => {
      cy.wrap(options).contains("decayed").click({ force: true });
    });
    cy.wait("@edit_list");

    cy.get('[data-cy="boreholes-number-preview"]').should("have.text", "169");
    cy.get('[data-cy="filter-chip-boreholestatus"]').contains("Borehole status");
  });

  it("filters boreholes by color and uscs3", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Lithology").click();
    cy.contains("Show all fields").children(".checkbox").click();

    let colorDropdown = cy.contains("label", "Colour").next();

    colorDropdown.click();
    colorDropdown
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
    verifyPaginationText("1–100 of 229");

    let uscs3Dropdown = cy.contains("label", "USCS 3").next();
    uscs3Dropdown.scrollIntoView().click({ force: true });
    uscs3Dropdown
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
    verifyPaginationText("1–39 of 39");
    cy.get(".MuiDataGrid-row").contains("Darion Rowe").should("exist");
  });

  function filterByOriginalLithology() {
    cy.contains("Lithology").click();
    cy.contains("Show all fields").children(".checkbox").click();
    cy.contains("Original lithology").next().find("input").type("Wooden Chair");
  }

  it("filters boreholes by original lithology in editor mode", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    filterByOriginalLithology();
    cy.wait("@edit_list");
    showTableAndWaitForData();
    verifyPaginationText("1–21 of 21");
  });
  it("filters boreholes by creation date", () => {
    goToRouteAndAcceptTerms("/");
    cy.get('[data-cy="show-filter-button"]').click();
    cy.contains("Registration").click();
    cy.contains("Show all fields").children(".checkbox").click();

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
    cy.get('[data-cy="show-filter-button"]').click();
    showTableAndWaitForData();
    cy.contains("Workgroup").click();
    cy.contains("Name").click();
    cy.wait("@borehole");
  });
});
