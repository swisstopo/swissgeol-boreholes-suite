import {
  newEditableBorehole,
  loginAsAdmin,
  createBorehole,
  setValueOfInputElement,
} from "../testHelpers";

describe("Test for the borehole form.", () => {
  it("Adds complete layer and displays it in viewer mode, checks if fields can be optionally hidden.", () => {
    // Assert map number of boreholes
    loginAsAdmin();
    cy.visit("/editor");
    cy.get("div[id=map]").should("be.visible");
    cy.get("tbody").children().should("have.length", 100);

    // Add new borehole
    newEditableBorehole().as("borehole_id");

    // enter original name
    cy.contains("label", "Original name")
      .next()
      .children("input")
      .type("BONES-XVII");
    cy.wait("@edit_patch");

    // navigate to stratigraphy
    cy.get('[data-cy="stratigraphy-menu-item"]').click();
    cy.get('[data-cy="lithology-menu-item"]').click();
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_POST");
    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();

    cy.contains("Show all fields").children(".checkbox").click();

    cy.get('[data-cy="toDepth"]').click().clear().type(50);

    // fill all dropdowns in layer
    cy.get('[data-cy="domain-dropdown"]')
      .should("have.length", 20)
      .each((el, index, list) =>
        cy
          .wrap(el)
          .scrollIntoView()
          .click({ force: true })
          .find('[role="option"]')
          .last()
          .click(),
      );

    // fill all multiselect dropdowns with an additional value
    cy.get('[aria-multiselectable="true"]')
      .should("have.length", 6)
      .each((el, index, list) => {
        cy.wrap(el)
          .scrollIntoView()
          .click({ force: true })
          .find('[role="option"]')
          .eq(1)
          .click();
        cy.wait("@update-layer");
      });

    // fill text fields
    cy.get('[data-cy="fromDepth"]').click().clear().type(0);
    cy.get('[data-cy="toDepth"]').click().clear().type(50);
    cy.get('[data-cy="originalUscs"]')
      .find("input")
      .click()
      .clear()
      .then(inputElement => {
        setValueOfInputElement(inputElement, "quirrel Milk Bar");
      })
      .type("S");
    cy.get('[data-cy="notes"]')
      .click()
      .clear()
      .then(inputElement => {
        setValueOfInputElement(
          inputElement,
          "hipping large amounts of almond sandwiches.",
        );
      })
      .type("S");
    cy.get('[data-cy="originalLithology"]')
      .find("input")
      .click()
      .clear()
      .then(inputElement => {
        setValueOfInputElement(inputElement, "ree peanuts.");
      })
      .type("F");

    // fill radio
    cy.get(".ui.radio.checkbox").first().click();

    // Lithology
    cy.get('[data-cy="domain-tree"] > input')
      .should("have.length", 1)
      .each((el, index, list) => {
        cy.wrap(el).scrollIntoView().click();
        cy.get('.modal [role="listitem"]').eq(5).click();
      });

    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    // go to viewer settings
    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Viewer").click();
    cy.contains("div", "Lithology fields").click();

    // select only one default field.
    cy.contains("button", "Unselect all").click();
    cy.wait("@codes");
    cy.get(".ui.fitted.checkbox").first().click({ force: true });
    cy.wait("@codes");

    // go to viewer mode
    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Viewer").click();

    cy.wait("@borehole");

    // Click on the added borehole
    cy.contains("Location").click();
    cy.contains("Original name").next().find("input").type("BONES-XVII");
    cy.wait("@borehole");

    cy.get(".table tbody").children().first().scrollIntoView().click();

    cy.wait("@borehole");
    cy.wait("@get-layers-by-profileId");
    cy.wait(5000);

    // Click on layer
    cy.get('[data-cy="stratigraphy-layer-0"]').scrollIntoView();
    cy.get('[data-cy="stratigraphy-layer-0"]').click({ force: true });

    // Three detail rows are displayed - two by default plus one that was selected as default field.
    cy.get('[data-cy="stratigraphy-layer-details"] h6').should(
      "have.length",
      3,
    );

    // Show all fields
    cy.get(".PrivateSwitchBase-input").click({ force: true });
    cy.get('[data-cy="stratigraphy-layer-details"] h6').should(
      "have.length",
      28,
    );
  });

  it("Checks if null values are displayed as dash.", () => {
    createBorehole({ "extended.original_name": "A1_Borehole" });
    loginAsAdmin();
    cy.visit("/");

    // Select borehole A1_Borehole
    cy.get("tbody").children().contains("td", "A1_Borehole").click();

    // Check if null value is set to dash.
    cy.get('[data-cy="restriction-label"]').contains("div", "-");
    cy.get('[data-cy="restriction_until-label"]').contains("div", "-");
    cy.get('[data-cy="kind-label"]').contains("div", "-");
    cy.get('[data-cy="qt_depth-label"]').contains("div", "-");

    // Check if all null values of data-cy="coordinates-div are displayed as dash.
    cy.get('[data-cy="coordinates-div"]')
      .children()
      .each(el => {
        cy.wrap(el).contains("div", "-");
      });
  });
});
