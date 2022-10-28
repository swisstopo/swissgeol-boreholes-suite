import {
  interceptApiCalls,
  newUneditableBorehole,
  deleteBorehole,
  login,
} from "../testHelpers";

describe("Instrumentation tests", () => {
  beforeEach(() => {
    interceptApiCalls();

    login("/editor");

    newUneditableBorehole().as("borehole_id");
    cy.get('[data-cy="completion-menu-item"]').click();
    cy.get('[data-cy="instrument-menu-item"]').click();
  });

  afterEach(() => {
    // delete borehole
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
  });

  it("Can add and delete instrument without completion", () => {
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);

    // add instrument with completion "no casing"
    cy.get('[data-cy="add-instrumentation-button"]').click();
    cy.wait("@edit_list");
    cy.wait("@layer");

    cy.get('[data-cy="casingName"]')
      .children()
      .first()
      .children()
      .first()
      .each((el, index, list) =>
        cy.wrap(el).click().find('[role="option"]').last().click(),
      );

    // header should contain one tab with name "No casind"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 1);

    // add another instrument without name of completion
    cy.get('[data-cy="add-instrumentation-button"]').click();

    // select tab "No completion"
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .first()
      .children()
      .first()
      .should("contain", "No casing")
      .click();

    // only one instrument should be displayed
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 1);

    // show all instruments
    cy.get('[data-cy="show-all-button"]').click();
    cy.get('[data-cy="instrument-list"]').children().should("have.length", 2);

    // delete instrument with "no completion" removes "No completion" tab.
    cy.get('[data-cy="delete-instrument-button"]').first().click();

    // header should not contain tabs
    cy.get('[data-cy="profile-header-list"]')
      .children()
      .should("have.length", 0);
  });

  it("Can add casing layer to instrument", () => {
    cy.contains("a", "Start editing").click();
    cy.wait("@edit_lock");

    // add two casings with two layers
    cy.get('[data-cy="casing-menu-item"]').click();

    // first casing
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait(2000);
    cy.wait("@stratigraphy_edit_create");
    cy.wait("@layer");
    cy.contains("div", "This is the main completion");

    cy.get('[data-cy="name"]').type("Moonshine Bike");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait(2000);
    cy.get('[data-cy="styled-layer-0"]').click();
    cy.get('[data-cy="casing_id"]').type("Moonshine Veal");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait(2000);
    cy.get('[data-cy="styled-layer-1"]').click();
    cy.get('[data-cy="casing_id"]').type("Moonshine Honey");

    // second casing
    cy.get('[data-cy="add-stratigraphy-button"]').click();
    cy.wait("@stratigraphy_edit_create");
    cy.wait("@layer");

    // navigate to correct tab
    cy.contains("div", "Unknown").click();
    cy.get('[data-cy="name"]').type("Sunshine Bike");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait(2000);
    cy.wait("@stratigraphy_layer_edit_create");
    cy.wait(2000);

    cy.get('[data-cy="styled-layer-0"]').click();
    cy.get('[data-cy="casing_id"]').type("Sunshine Veal");

    cy.get('[data-cy="add-layer-button"]').click();
    cy.wait("@layer");
    cy.wait(2000);
    cy.wait("@stratigraphy_layer_edit_create");
    cy.wait(2000);

    cy.get('[data-cy="styled-layer-1"]').scrollIntoView().click();
    cy.get('[data-cy="casing_id"]').type("Sunshine Honey");

    // add instrument
    cy.get('[data-cy="instrument-menu-item"]').click();
    cy.wait("@layer");
    cy.wait(2000);

    cy.get('[data-cy="add-instrumentation-button"]').click({ force: true });
    cy.wait(2000);
    cy.wait("@layer-v2");

    // chose first  casing
    const casingDropDown = cy
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
        .eq(1)
        .click({ force: true }),
    );

    casingDropDown.contains("Moonshine Bike");

    // chose second casingLayer
    const casingLayerDropDown = cy
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

    // chose second casing
    casingDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );
    casingDropDown.contains("Moonshine Bike");

    // change of casing resets casingLayer
    casingLayerDropDown.should("not.contain", "Moonshine Bike");

    // dropdown Options in casingLayer dropdown have updated
    casingLayerDropDown.each((el, index, list) =>
      cy
        .wrap(el)
        .click({ force: true })
        .find('[role="option"]')
        .eq(2)
        .click({ force: true }),
    );

    casingLayerDropDown.contains("Sunshine Honey");
  });
});
