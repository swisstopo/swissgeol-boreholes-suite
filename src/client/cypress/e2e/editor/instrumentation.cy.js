import {
  interceptApiCalls,
  newUneditableBorehole,
  deleteBorehole,
  login,
} from "../testHelpers";

const delayedType = (selector, string) => {
  const element = cy.get(selector);
  cy.wait(500);
  element.type(string);
};

const addInstrumentLayer = () => {
  cy.get('[data-cy="add-instrumentation-button"]').click();
  cy.wait("@stratigraphy_layer_edit_create");
  cy.wait("@layer");
  cy.wait(5000);
};

describe("Instrumentation tests", () => {
  beforeEach(() => {
    interceptApiCalls();

    login("/editor");

    newUneditableBorehole().as("borehole_id");
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
  });

  afterEach(() => {
    // Delete borehole
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });

  it("Displays correct messages", () => {
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "No instrumentation available",
    );
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "For the recording of an instrument please click the plus symbol at the top left",
    );
    cy.contains("a", "Stop editing").click();
  });

  it("Can add and delete instrument without completion", () => {
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // Header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);

    addInstrumentLayer();
    cy.wait(500);

    cy.get('[data-cy="casingName"]')
      .children()
      .first()
      .children()
      .first()
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    // Header should contain one tab with name "No casing"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 1);

    // Add another instrument without name of completion
    addInstrumentLayer();
    cy.wait(500);

    // Select tab "No completion"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .first()
      .children()
      .first()
      .should("contain", "No casing")
      .click();

    // Only one instrument should be displayed
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 1);

    // Show all instruments
    cy.get('[data-cy="show-all-button"]').click();
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 2);

    // Delete instrument with "no completion" removes "No completion" tab.
    cy.get('[data-cy="delete-instrument-button"]').first().click();

    // Header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);

    cy.contains("a", "Stop editing").click();
  });

  it("Can add casing layer to instrument", () => {
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // Add two casings with two layers
    cy.get('[data-cy="casing-menu-item"]').click();

    // First casing
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.wait("@layer");
    cy.contains("div", "This is the main completion");

    delayedType('[data-cy="name"]', "Moonshine Bike");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"]').click();
    delayedType('[data-cy="casing_id"]', "Moonshine Veal");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-1"]').click();
    delayedType('[data-cy="casing_id"]', "Moonshine Honey");

    // Second casing
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.wait("@layer");

    // Navigate to correct tab
    cy.contains("div", "Unknown").click();
    delayedType('[data-cy="name"]', "Sunshine Bike");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait("@stratigraphy_layer_edit_create");

    cy.get('[data-cy="styled-layer-0"]').click();
    delayedType('[data-cy="casing_id"]', "Sunshine Veal");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait("@stratigraphy_layer_edit_create");

    cy.get('[data-cy="styled-layer-1"]').scrollIntoView().click();
    delayedType('[data-cy="casing_id"]', "Sunshine Honey");

    // Add instrument
    cy.get('[data-cy="instrument-menu-item"]').click();
    cy.wait("@layer");

    addInstrumentLayer();
    cy.wait(500);

    // Chose first casing
    let casingDropDown = cy
      .get('[data-cy="casingName"]')
      .children()
      .first()
      .children()
      .first();

    casingDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );

    casingDropDown.contains("Moonshine Bike");

    cy.wait("@casing-layers");
    cy.wait(3000);

    // Choose second casingLayer
    let casingLayerDropDown = cy
      .get('[data-cy="casingId"]')
      .children()
      .first()
      .children()
      .first();

    casingLayerDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );

    casingLayerDropDown.contains("Moonshine Honey");

    casingDropDown = cy
      .get('[data-cy="casingName"]')
      .children()
      .first()
      .children()
      .first();

    // Choose second casing
    casingDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(3)
        .click({ force: true }),
    );

    cy.wait("@casing-layers");
    cy.wait(3000);

    casingDropDown.contains("Sunshine Bike");

    casingLayerDropDown = cy
      .get('[data-cy="casingId"]')
      .children()
      .first()
      .children()
      .first();

    // Change of casing should reset casingLayer
    casingLayerDropDown.should("not.contain", "Moonshine Bike");

    cy.wait("@casing-layers");
    cy.wait(3000);

    // Dropdown options in casingLayer dropdown have updated
    casingLayerDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );

    cy.wait("@casing-layers");
    cy.wait(3000);

    casingLayerDropDown.contains("Sunshine Honey");
    cy.contains("a", "Stop editing").click();
  });
});
