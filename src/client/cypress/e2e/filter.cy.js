import { login } from "../e2e/testHelpers";

describe("Search filter tests", () => {
  it("has search filters", () => {
    login();
    cy.contains("Search filters:");
  });

  it("shows the correct dropdowns", () => {
    login();
    cy.contains("span", "Location").click();
    cy.contains("Show all fields").children().eq(0).click();
    let restrictionDropdown = cy.contains("label", "Identifier").next();

    restrictionDropdown.click();
    restrictionDropdown
      .find("div[role='option']")
      .should("have.length", 2)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("Unique id");
      });

    cy.contains("span", "Borehole").click();
    let boreholeTypeDropdown = cy.contains("label", "Borehole type").next();

    boreholeTypeDropdown.click();
    boreholeTypeDropdown
      .find("div[role='option']")
      .should("have.length", 5)
      .should(options => {
        expect(options[0]).to.have.text("Reset");
        expect(options[1]).to.have.text("borehole");
        expect(options[2]).to.have.text("penetration test");
        expect(options[3]).to.have.text("trial pit");
        expect(options[4]).to.have.text("other");
      });
  });

  it("shows 'fiter by map' in editor on 'Large Map' appearance", () => {
    login("/setting/explorer");
    cy.contains("Appearance").click();
    cy.contains("Large Map").children(".checkbox").click();
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Editor").click();

    cy.contains("Filter by map");

    // reset appearance
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Settings").click();
    cy.contains("Appearance").click();
    cy.contains("Full").children(".checkbox").click();
  });

  it("checks that the registration filter settings control the filter visibility.", () => {
    // precondition filters not visible
    cy.contains("Registration").click();
    cy.contains("Show all fields")
      .next()
      .within(() => {
        cy.contains("Created by").should("not.exist");
        cy.contains("Creation date").should("not.exist");
      });

    // turn on registration filters
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Settings").click();
    cy.contains("Editor").click();
    cy.contains("Registration filters").click();
    cy.contains("Select all").click();
    cy.wait("@setting");

    // check visibility of filters
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Editor").click();
    cy.contains("Registration").click();
    cy.contains("Created by");
    cy.contains("Creation date");

    // reset setting
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Settings").click();
    cy.contains("Editor").click();
    cy.contains("Registration filters").click();
    cy.contains("Unselect all").click();
    cy.wait("@setting");
  });

  it("filters boreholes by creator name", () => {
    cy.contains("Registration").click();
    cy.contains("Show all fields").children(".checkbox").click();

    // input value
    cy.contains("Created by").next().find("input").type("val_da%r");
    cy.wait("@edit_list");

    // check content of table
    cy.get('[data-cy="borehole-table"] tbody')
      .children()
      .should("have.length", 100)
      .each((el, index, list) => {
        cy.wrap(el).contains("validator");
      });
  });

  it("filters boreholes by original lithology", () => {
    cy.contains("Stratigraphy").click();
    cy.contains("Show all fields").children(".checkbox").click();

    // input value
    cy.contains("Original Lithology")
      .next()
      .find("input")
      .type("Director Toys");
    cy.wait("@edit_list");

    // check content of table
    cy.get('[data-cy="borehole-table"] tbody')
      .children()
      .should("have.length", 11)
      .each((el, index, list) => {
        cy.wrap(el).contains("admin");
      });
  });

  it("filters boreholes by creation date", () => {
    cy.contains("Registration").click();
    cy.contains("Show all fields").children(".checkbox").click();

    // input values
    cy.contains("Creation date")
      .next()
      .find(".react-datepicker-wrapper input")
      .click();

    cy.get(".react-datepicker__year-select").select("2021");
    cy.get(".react-datepicker__month-select").select("November");
    cy.get(".react-datepicker__day--009").click();

    cy.wait("@edit_list");

    cy.contains("Creation date")
      .parent()
      .parent()
      .next()
      .find(".react-datepicker-wrapper input")
      .click();

    cy.get(".react-datepicker__year-select").select("2021");
    cy.get(".react-datepicker__month-select").select("November");
    cy.get(".react-datepicker__day--010").click();

    cy.wait("@edit_list");

    // check content of table
    cy.get('[data-cy="borehole-table"] tbody')
      .children()
      .should("have.length", 9)
      .each((el, index, list) => {
        cy.wrap(el).contains("09.11.2021");
      });
  });
});
