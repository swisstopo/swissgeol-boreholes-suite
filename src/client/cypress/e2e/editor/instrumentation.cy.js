import {
  loginAsAdmin,
  bearerAuth,
  createBorehole,
  startBoreholeEditing,
} from "../helpers/testHelpers";
import { setInput, setSelect } from "../helpers/formHelpers";

describe("Instrumentation crud tests", () => {
  it("add, edit and delete instrumentations", () => {
    createBorehole({ "extended.original_name": "INTEADAL" })
      .as("borehole_id")
      .then(id =>
        cy.get("@id_token").then(token => {
          cy.request({
            method: "POST",
            url: "/api/v2/completion",
            cache: "no-cache",
            credentials: "same-origin",
            headers: {
              "Content-Type": "application/json",
            },
            body: {
              boreholeId: id,
              isPrimary: true,
              kindId: 16000002,
            },
            auth: bearerAuth(token),
          }).then(response => {
            expect(response).to.have.property("status", 200);
          });
        }),
      );

    // open completion editor
    cy.get("@borehole_id").then(id => {
      loginAsAdmin();
      cy.visit(`/editor/${id}/completion`);
    });

    cy.wait("@get-completions-by-boreholeId");

    // start editing session
    startBoreholeEditing();

    // Precondition: Create casing to later link in instrumentation
    cy.get("[data-cy=completion-content-header-tab-Casing]").click();
    cy.wait("@casing_GET");

    cy.get('[data-cy="addCasing-button"]').click({ force: true });
    cy.wait("@codelist_GET");

    setInput("name", "casing-1");
    setInput("fromDepth", "0");
    setInput("toDepth", "10");
    setSelect("kindId", 2);
    setSelect("materialId", 3);
    setInput("dateStart", "2021-01-01");
    setInput("dateFinish", "2021-01-02");
    setInput("innerDiameter", "3");
    setInput("outerDiameter", "4");

    cy.get('[data-cy="save-icon"]').click();
    cy.wait("@casing_GET");

    cy.get("[data-cy=completion-content-header-tab-Instrumentation]").click();
    cy.wait("@instrumentation_GET");

    // create instrumentation
    cy.get('[data-cy="addInstrument-button"]').click({ force: true });
    cy.wait("@casing_GET");

    // fill out form
    setInput("notes", "Lorem.");
    setInput("name", "Inst-1");
    setInput("fromDepth", "123456");
    setInput("toDepth", "987654");
    setSelect("kindId", 2);
    setSelect("statusId", 1);

    // save instrumentation
    cy.get('[data-cy="save-icon"]').click();

    // check if instrumentation is saved
    cy.contains("123456");
    cy.contains("987654");
    cy.contains("Inst-1");
    cy.contains("Lorem.");
    cy.contains("suction pump");
    cy.contains("inactive");

    // edit instrumentation
    cy.get('[data-cy="edit-icon"]').click({ force: true });

    // We need the casings for the casing name dropdown
    cy.wait("@casing_GET");
    setInput("fromDepth", "222");
    setSelect("casingId", 1);

    // close editing mask
    cy.get('[data-cy="save-icon"]').click({ force: true });
    cy.contains("casing-1");
    cy.contains("222");
    cy.contains("inactive");

    // delete instrumentation
    cy.get('[data-cy="delete-icon"]').click({ force: true });
    cy.contains("From depth").should("not.exist");
  });
});
