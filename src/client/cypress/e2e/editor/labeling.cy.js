import {
  interceptShowLabelingCall,
  newEditableBorehole,
  newUneditableBorehole,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

const isFileActive = (fileName, isActive) => {
  cy.contains("span", fileName)
    .parents("div")
    .siblings(".MuiListItemIcon-root")
    .find("svg.lucide.lucide-check")
    .should(isActive ? "exist" : "not.exist");
};

describe("Test labeling tool", () => {
  beforeEach(() => {
    interceptShowLabelingCall();
  });

  it("can show labeling panel", () => {
    newUneditableBorehole().as("borehole_id");
    // only show in editing mode
    cy.get('[data-cy="labeling-toggle-button"]').should("not.exist");

    // panel is closed by default
    startBoreholeEditing();
    cy.get('[data-cy="labeling-toggle-button"]').should("exist");
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    // panel can be opened and closed
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("exist");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    // panel open state should be reset when editing is stopped, panel position should be preserved
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("exist");
    cy.get('[data-cy="labeling-panel-position-right"]').should("have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').click();
    cy.get('[data-cy="labeling-panel-position-right"]').should("not.have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");

    stopBoreholeEditing();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");
    startBoreholeEditing();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");
  });

  it("can select file", () => {
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
    cy.get('[data-cy="labeling-file-selector"]').contains("No documents have been uploaded yet.");

    cy.get('[data-cy="labeling-file-dropzone"]').attachFile("import/borehole_attachment_1.pdf", {
      subjectType: "drag-n-drop",
    });
    cy.wait("@get-borehole-files");
    cy.get('[data-cy="labeling-file-button-select"]').contains("borehole_attachment_1.pdf");

    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
    cy.get('[data-cy="labeling-file-selector"]').contains("No documents have been uploaded yet.").should("not.exist");
    cy.get('[data-cy="labeling-file-selector"]').contains("borehole_attachment_1.pdf").should("exist");
    cy.get('[data-cy="labeling-file-dropzone"]').attachFile("import/borehole_attachment_3.pdf", {
      subjectType: "drag-n-drop",
    });
    cy.wait("@get-borehole-files");
    cy.get('[data-cy="labeling-file-button-select"]').contains("borehole_attachment_3.pdf");
    cy.get('[data-cy="labeling-file-button-select"]').click();

    isFileActive("borehole_attachment_1.pdf", false);
    isFileActive("borehole_attachment_3.pdf", true);

    const crypto = window.crypto || window.msCrypto;
    cy.get("input[type=file]").selectFile(
      {
        contents: Cypress.Buffer.from(crypto.getRandomValues(new Uint32Array(1)).toString()),
        fileName: "WOLFHEART.pdf",
        mimeType: "application/pdf",
      },
      { force: true },
    );

    cy.get('[data-cy="labeling-file-button-select"]').contains("WOLFHEART.pdf");
    cy.get('[data-cy="button-select-popover"] .MuiListItem-root').eq(1).click();
    cy.get('[data-cy="labeling-file-button-select"]').contains("borehole_attachment_3.pdf");
  });
});
