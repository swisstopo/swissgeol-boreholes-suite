import {
  newUneditableBorehole,
  delayedType,
  loginAsViewer,
  createBorehole,
} from "../testHelpers";

const addInstrumentLayer = () => {
  cy.wait(1000);
  cy.get('[data-cy="add-instrumentation-button"]').click({ force: true });
  cy.wait("@stratigraphy_layer_edit_create");
  cy.wait("@layer");
  cy.wait(5000);
};

describe("Instrumentation tests", () => {
  it("Displays correct 'No Instumentation' message when logged in as viewer and no stratigraphies are defined", () => {
    createBorehole({ "extended.original_name": "A1_Borehole" });
    loginAsViewer("/editor");

    // Select borehole A1_Borehole
    cy.get("tbody").children().contains("td", "A1_Borehole").click();
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
    cy.get('[data-cy="instrument-message"]').should(
      "contain",
      "No instrumentation available",
    );
  });
});

describe("Instrumentation tests", () => {
  beforeEach(() => {
    // Add new borehole
    newUneditableBorehole().as("borehole_id");
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
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

    delayedType(cy.get('[data-cy="name"]'), "Moonshine Bike");

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    delayedType(cy.get('[data-cy="casing_id"]'), "Moonshine Veal");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ModeEditIcon"]').click();
    delayedType(cy.get('[data-cy="casing_id"]'), "Moonshine Honey");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ClearIcon"]').click();

    // Second casing
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.wait("@layer");

    // Navigate to correct tab
    cy.contains("div", "Unknown").click();
    delayedType(cy.get('[data-cy="name"]'), "Sunshine Bike");

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.wait("@stratigraphy_layer_edit_create");

    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    delayedType(cy.get('[data-cy="casing_id"]'), "Sunshine Veal");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.wait("@stratigraphy_layer_edit_create");

    cy.get('[data-cy="styled-layer-1"] [data-testid="ModeEditIcon"]')
      .scrollIntoView()
      .click();
    delayedType(cy.get('[data-cy="casing_id"]'), "Sunshine Honey");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ClearIcon"]').click();

    // Add instrument
    cy.get('[data-cy="instrument-menu-item"]').click();
    cy.wait("@layer");

    addInstrumentLayer();

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

    cy.wait("@layer-by-profileId");

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

    casingDropDown.contains("Sunshine Bike");

    casingLayerDropDown = cy
      .get('[data-cy="casingId"]')
      .children()
      .first()
      .children()
      .first();

    // Change of casing should reset casingLayer
    casingLayerDropDown.should("not.contain", "Moonshine Bike");

    // Dropdown options in casingLayer dropdown have updated
    casingLayerDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );

    casingLayerDropDown.contains("Sunshine Honey");
    cy.contains("a", "Stop editing").click();
  });
});
