import {
  interceptApiCalls,
  deleteBorehole,
  newEditableBorehole,
  delayedType,
  login,
} from "../testHelpers";

describe("Tests for editing coordinates of a borehole.", () => {
  beforeEach(() => {
    interceptApiCalls();

    login();

    // go to edit
    cy.get('[data-cy="menu"]').click();
    cy.contains("h4", "Editor").click();
    cy.wait("@edit_list");
  });

  it("creates new borehole and adds coordinates", () => {
    newEditableBorehole().as("borehole_id");

    // fill inputs for LV95
    delayedType(
      cy.get('[data-cy="LV95X"]').children().first(),
      "2645123.12124",
    );
    delayedType(
      cy.get('[data-cy="LV95Y"]').children().first(),
      "1245794.92348",
    );

    // wait edits of all 4 inputs to complete
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    // verify automatically filled inputs for LV03
    cy.get('[data-cy="LV95X"]')
      .children()
      .first()
      .should("have.value", 2645123.12124);
    cy.get('[data-cy="LV95Y"]')
      .children()
      .first()
      .should("have.value", 1245794.92348);
    cy.get('[data-cy="LV03X"]')
      .children()
      .first()
      .should("have.value", 645122.39962);
    cy.get('[data-cy="LV03Y"]')
      .children()
      .first()
      .should("have.value", 245794.77398);

    // clear and fill again with less decimals.
    cy.get('[data-cy="LV95X"]').children().first().clear();
    delayedType(cy.get('[data-cy="LV95X"]').children().first(), "2645123.12");

    // wait edits of all 4 inputs to complete
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");

    // automatically filled LV03
    cy.get('[data-cy="LV03X"]')
      .children()
      .first()
      .should("have.value", 645122.4);
    cy.get('[data-cy="LV03Y"]')
      .children()
      .first()
      .should("have.value", 245794.77);

    //switch reference system
    cy.get("input[value=20104002]").click();
    // verify all inputs are empty
    cy.get('[data-cy="LV95X"]').children().first().should("be.empty");
    cy.get('[data-cy="LV95Y"]').children().first().should("be.empty");
    cy.get('[data-cy="LV03X"]').children().first().should("be.empty");
    cy.get('[data-cy="LV03Y"]').children().first().should("be.empty");

    // delete borehole
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });

  it("validates inputs", () => {
    newEditableBorehole().as("borehole_id");

    // divs have errors as long as inputs are empty
    cy.get("[name=location_x_lv03]").should("have.class", "error");
    cy.get("[name=location_y_lv03]").should("have.class", "error");
    cy.get("[name=location_x]").should("have.class", "error");
    cy.get("[name=location_y]").should("have.class", "error");

    // type valid coordinates
    cy.get('[data-cy="LV95X"]').children().first().scrollIntoView();
    delayedType(
      cy.get('[data-cy="LV95X"]').children().first(),
      "2645123.12124",
    );
    cy.get('[data-cy="LV95Y"]').children().first().scrollIntoView();
    delayedType(
      cy.get('[data-cy="LV95Y"]').children().first(),
      "1245794.92348",
    );

    // divs have errors as long as inputs are empty
    cy.get("[name=location_x_lv03]").should("not.have.class", "error");
    cy.get("[name=location_y_lv03]").should("not.have.class", "error");
    cy.get("[name=location_x]").should("not.have.class", "error");
    cy.get("[name=location_y]").should("not.have.class", "error");

    // wait edits of all 4 inputs to complete
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");
    cy.wait("@edit_patch");

    // type coordinates that are out of bounds
    cy.get('[data-cy="LV95X"]').children().first().clear();
    delayedType(cy.get('[data-cy="LV95X"]').children().first(), "264512");

    cy.get('[data-cy="LV95Y"]').children().first().clear();
    delayedType(cy.get('[data-cy="LV95Y"]').children().first(), "124579");

    // divs that changed have errors
    cy.get("[name=location_x_lv03]").should("not.have.class", "error");
    cy.get("[name=location_y_lv03]").should("not.have.class", "error");
    cy.get("[name=location_x]").should("have.class", "error");
    cy.get("[name=location_y]").should("have.class", "error");

    // delete borehole
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });

  it("edits borehole and changes coordinates from map", () => {
    newEditableBorehole().as("borehole_id");

    //start with references system LV03
    cy.get("input[value=20104002]").click();
    cy.get("input[value=20104002]").should("be.checked");

    // verify switches reference system

    cy.get('[class="ol-viewport"]')
      .scrollIntoView()
      .click(390, 250, { force: true });

    cy.wait("@location");

    cy.get('[data-cy="apply-button"]').click();

    // verify automatically filled inputs
    cy.get('[data-cy="LV95X"]')
      .children()
      .first()
      .should("have.value", 2797750);
    cy.get('[data-cy="LV95Y"]')
      .children()
      .first()
      .should("have.value", 1177320.31);
    cy.get('[data-cy="LV03X"]')
      .children()
      .first()
      .should("have.value", 797749.0665);
    cy.get('[data-cy="LV03Y"]')
      .children()
      .first()
      .should("have.value", 177320.3968);

    // verify original reference system has switched to LV95
    cy.get("input[value=20104002]").should("not.be.checked");
    cy.get("input[value=20104001]").should("be.checked");

    //delete borehole;
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });
});
