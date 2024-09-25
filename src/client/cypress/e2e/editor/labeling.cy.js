import Draw from "ol/interaction/Draw";
import { evaluateCoordinate, evaluateSelect, hasAiStyle, hasError, isDisabled } from "../helpers/formHelpers.js";
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

    // Cannot draw if the panel was opened with the panel toggle button
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.false;
    });
  });

  it.skip("can extract data from image", () => {
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
    cy.get('[data-cy="labeling-file-selector"]').contains("No documents have been uploaded yet.");

    cy.get('[data-cy="labeling-file-dropzone"]').selectFile("cypress/fixtures/labeling_attachment.pdf", {
      force: true,
      mimeType: "application/pdf",
      fileName: "labeling_attachment.pdf",
    });

    cy.wait("@get-borehole-files");
    cy.wait("@extraction-file-info");
    cy.wait("@dataextraction");
    cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
    cy.get('[data-cy="labeling-page-count"]').contains("1 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("not.be.disabled");

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.get('[data-cy="labeling-draw-tooltip"]').should("to.be.visible");
    cy.get('[data-cy="labeling-draw-tooltip"]').contains("Draw box around north & east coordinates");
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.true;
    });

    evaluateSelect("spatial_reference_system", "20104001");
    hasAiStyle("spatial_reference_system");
    hasError("spatial_reference_system", false);
    evaluateCoordinate("location_x", "");
    hasAiStyle("location_x");
    hasError("location_x", false);
    evaluateCoordinate("location_y", "");
    hasAiStyle("location_y");
    hasError("location_y", false);
    evaluateCoordinate("location_x_lv03", "");
    hasAiStyle("location_x_lv03");
    hasError("location_x_lv03", false);
    isDisabled("location_x_lv03");
    evaluateCoordinate("location_y_lv03", "");
    hasAiStyle("location_y_lv03");
    hasError("location_y_lv03", false);
    isDisabled("location_y_lv03");

    // Can draw box around coordinates and extract correct coordinates
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 400, y: 60 })
      .trigger("pointerup", { x: 400, y: 60 });
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 600, y: 170 })
      .trigger("pointerup", { x: 600, y: 170 });

    cy.wait(1000);
    cy.wait("@extract_data");
    cy.get('[data-cy="labeling-draw-tooltip"]').should("not.to.be.visible");
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.false;
    });

    evaluateSelect("spatial_reference_system", "20104001");
    evaluateCoordinate("location_x", "2'646'359.70");
    hasError("location_x", false);
    isDisabled("location_x", false);
    evaluateCoordinate("location_y", "1'249'017.82");
    hasError("location_y", false);
    isDisabled("location_y", false);
    evaluateCoordinate("location_x_lv03", "646'359.70");
    hasError("location_x_lv03", false);
    isDisabled("location_x_lv03", true);
    evaluateCoordinate("location_y_lv03", "249'017.82");
    hasError("location_y_lv03", false);
    isDisabled("location_y_lv03", true);

    // Can draw after navigating to the next page and extract correct bbox from rotated, zoomed image
    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.get('[data-cy="labeling-page-next"]').click();
    cy.wait("@extraction-file-info");
    cy.wait("@dataextraction");
    cy.wait(1000);
    cy.get('[data-cy="labeling-page-count"]').contains("2 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("not.be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("not.be.disabled");

    cy.window().then(win => {
      const view = win.labelingImage.getView();
      expect(view.getRotation()).to.equal(0);
    });
    cy.get('[data-cy="rotate-button"]').click();
    cy.window().then(win => {
      const view = win.labelingImage.getView();
      expect(view.getRotation()).to.equal(Math.PI / 2);
    });
    cy.wait(1000);

    cy.get('[data-cy="labeling-panel"] [data-cy="zoom-in-button"]').click();
    cy.wait(1000);
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 600, y: 60 })
      .trigger("pointerup", { x: 600, y: 200 });
    cy.wait(1000);

    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.true;
    });

    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 600, y: 60 })
      .trigger("pointerup", { x: 600, y: 60 });
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 800, y: 170 })
      .trigger("pointerup", { x: 800, y: 170 });

    cy.wait(1000);
    cy.wait("@extract_data");

    evaluateSelect("spatial_reference_system", "20104002");
    evaluateCoordinate("location_x", "2'646'465.97");
    hasError("location_x", false);
    isDisabled("location_x", true);
    evaluateCoordinate("location_y", "1'249'931.66");
    hasError("location_y", false);
    isDisabled("location_y", true);
    evaluateCoordinate("location_x_lv03", "646'465.97");
    hasError("location_x_lv03", false);
    isDisabled("location_x_lv03", false);
    evaluateCoordinate("location_y_lv03", "249'931.66");
    hasError("location_y_lv03", false);
    isDisabled("location_y_lv03", false);

    // Shows alert if no coordinates are extracted
    cy.get('[data-cy="labeling-page-next"]').click();
    cy.wait("@extraction-file-info");
    cy.wait("@dataextraction");
    cy.get('[data-cy="labeling-page-count"]').contains("3 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("not.be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("be.disabled");
    cy.wait(1000);

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.true;
    });
    cy.wait(1000);
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 50, y: 60 })
      .trigger("pointerup", { x: 50, y: 60 });
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 400, y: 110 })
      .trigger("pointerup", { x: 400, y: 110 });
    cy.wait(1000);
    cy.wait("@extract_data");

    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.false;
    });

    evaluateSelect("spatial_reference_system", "20104002");
    evaluateCoordinate("location_x", "2'646'465.97");
    evaluateCoordinate("location_y", "1'249'931.66");
    evaluateCoordinate("location_x_lv03", "646'465.97");
    evaluateCoordinate("location_y_lv03", "249'931.66");

    cy.get('[data-cy="labeling-alert"]').contains("Coordinates not found.");

    // Drawing is active immediately when opening the panel with the labeling-button
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
    cy.contains("labeling_attachment.pdf").click();
    cy.wait("@extraction-file-info");
    cy.wait("@dataextraction");
    cy.wait(1000);

    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.true;
    });

    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 400, y: 60 })
      .trigger("pointerup", { x: 400, y: 60 });
    cy.get('[data-cy="labeling-panel"]')
      .trigger("pointerdown", { x: 600, y: 170 })
      .trigger("pointerup", { x: 600, y: 170 });
    cy.wait(1000);
    cy.wait("@extract_data");
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction instanceof Draw)).to.be.false;
    });

    evaluateSelect("spatial_reference_system", "20104001");
    evaluateCoordinate("location_x", "2'646'359.70");
    hasError("location_x", false);
    isDisabled("location_x", false);
    evaluateCoordinate("location_y", "1'249'017.82");
    hasError("location_y", false);
    isDisabled("location_y", false);
    evaluateCoordinate("location_x_lv03", "646'359.70");
    hasError("location_x_lv03", false);
    isDisabled("location_x_lv03", true);
    evaluateCoordinate("location_y_lv03", "249'017.82");
    hasError("location_y_lv03", false);
    isDisabled("location_y_lv03", true);
  });
});
