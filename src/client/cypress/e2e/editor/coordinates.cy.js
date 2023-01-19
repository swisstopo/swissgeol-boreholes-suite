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
    newEditableBorehole().as("borehole_id");

    cy.get('[data-cy="LV95X"]').as("LV95X-input");
    cy.get('[data-cy="LV95Y"]').as("LV95Y-input");
    cy.get('[data-cy="LV03X"]').as("LV03X-input");
    cy.get('[data-cy="LV03Y"]').as("LV03Y-input");
  });

  afterEach(() => {
    // Delete borehole if it was created.
    if (cy.state("aliases")?.borehole_id) {
      cy.get("@borehole_id").then(id => deleteBorehole(id));
    }
  });

  it("creates new borehole and adds coordinates", () => {
    // fill inputs for LV95
    cy.wait(500);
    cy.get("@LV95X-input").type("2645123");
    cy.wait(500);
    cy.get("@LV95Y-input").type("1245794");
    // wait edits of all 4 inputs to complete
    cy.wait([
      "@location",
      "@edit_patch",
      "@edit_patch",
      "@edit_patch",
      "@edit_patch",
    ]);
    // verify automatically filled inputs for LV03
    cy.get("@LV95Y-input").should("have.value", "1'245'794");
    cy.get("@LV03Y-input").should("have.value", "245'794");
    cy.get("@LV03X-input").should("have.value", "645'122");

    //switch reference system
    cy.get("input[value=20104002]").click();
    // verify all inputs are empty
    cy.get("@LV95X-input").should("be.empty");
    cy.get("@LV95Y-input").should("be.empty");
    cy.get("@LV03X-input").should("be.empty");
    cy.get("@LV03Y-input").should("be.empty");
  });

  it("validates inputs", () => {
    // divs have errors as long as inputs are empty
    cy.get("[name=location_x_lv03]").should("have.class", "error");
    cy.get("[name=location_y_lv03]").should("have.class", "error");
    cy.get("[name=location_x]").should("have.class", "error");
    cy.get("[name=location_y]").should("have.class", "error");

    // type valid coordinates
    cy.get("@LV95X-input").scrollIntoView();
    delayedType(cy.get("@LV95X-input"), "2645123.12124");
    cy.get("@LV95Y-input").scrollIntoView();
    delayedType(cy.get("@LV95Y-input"), "1245794.92348");

    // divs have errors as long as inputs are empty
    cy.get("[name=location_x_lv03]").should("not.have.class", "error");
    cy.get("[name=location_y_lv03]").should("not.have.class", "error");
    cy.get("[name=location_x]").should("not.have.class", "error");
    cy.get("[name=location_y]").should("not.have.class", "error");

    // wait edits of all 4 inputs to complete
    cy.wait([
      "@location",
      "@edit_patch",
      "@edit_patch",
      "@edit_patch",
      "@edit_patch",
    ]);

    // type coordinates that are out of bounds
    cy.get("@LV95X-input").clear();
    delayedType(cy.get("@LV95X-input"), "264512");

    cy.get("@LV95Y-input").clear();
    delayedType(cy.get("@LV95Y-input"), "124579");

    // divs that changed have errors
    cy.get("[name=location_x_lv03]").should("not.have.class", "error");
    cy.get("[name=location_y_lv03]").should("not.have.class", "error");
    cy.get("[name=location_x]").should("have.class", "error");
    cy.get("[name=location_y]").should("have.class", "error");
  });

  it("edits borehole and changes coordinates from map", () => {
    //start with references system LV03
    cy.get("input[value=20104002]").click();
    cy.get("input[value=20104002]").should("be.checked");

    // verify automatically filled inputs
    cy.get("@LV95X-input").should("have.value", "");
    cy.get("@LV95Y-input").should("have.value", "");
    cy.get("@LV03X-input").should("have.value", "");
    cy.get("@LV03Y-input").should("have.value", "");

    // zoom into map
    cy.get('[class="ol-zoom-in"]').click({ force: true });
    cy.get('[class="ol-zoom-in"]').click({ force: true });

    cy.wait(2000);
    // click on map
    cy.get('[class="ol-viewport"]')
      .scrollIntoView()
      .click(390, 250, { force: true });

    cy.wait("@location");
    cy.get('[data-cy="apply-button"]').click();

    // verify automatically filled inputs
    cy.get("@LV95X-input").should("not.have.value", "");
    cy.get("@LV95Y-input").should("not.have.value", "");
    cy.get("@LV03X-input").should("not.have.value", "");
    cy.get("@LV03Y-input").should("not.have.value", "");

    // verify original reference system has switched to LV95
    cy.get("input[value=20104002]").should("not.be.checked");
    cy.get("input[value=20104001]").should("be.checked");
  });
});
