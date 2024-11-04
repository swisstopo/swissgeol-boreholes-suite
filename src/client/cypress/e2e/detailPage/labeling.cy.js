import { evaluateCoordinate, evaluateSelect, hasAiStyle, hasError, isDisabled } from "../helpers/formHelpers.js";
import {
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

const drawBox = (x1, y1, x2, y2) => {
  cy.get('[data-cy="labeling-draw-tooltip"]').should("to.be.visible");
  cy.get('[data-cy="labeling-draw-tooltip"]').contains("Draw box around north & east coordinates");
  cy.window().then(win => {
    const interactions = win.labelingImage.getInteractions().getArray();
    expect(
      interactions.some(interaction => {
        return interaction.constructor.name === "Draw";
      }),
    ).to.be.true;
  });
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x1, y: y1 }).trigger("pointerup", { x: x1, y: y1 });
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x2, y: y2 }).trigger("pointerup", { x: x2, y: y2 });

  cy.wait("@extract-data");
  cy.get('[data-cy="labeling-draw-tooltip"]').should("not.to.be.visible");
  cy.window().then(win => {
    const interactions = win.labelingImage.getInteractions().getArray();
    expect(
      interactions.some(interaction => {
        return interaction.constructor.name === "Draw";
      }),
    ).to.be.false;
  });
};

const waitForLabelingImageLoaded = () => {
  cy.wait("@extraction-file-info");
  cy.wait("@load-extraction-file");
  cy.window().then(win => {
    const layers = win.labelingImage.getLayers().getArray();
    expect(
      layers.some(layer => {
        return layer.constructor.name === "ImageLayer";
      }),
    ).to.be.true;
  });
};

describe("Test labeling tool", () => {
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
    waitForLabelingImageLoaded();
    cy.window().then(win => {
      const interactions = win.labelingImage.getInteractions().getArray();
      expect(interactions.some(interaction => interaction.constructor.name === "Draw")).to.be.false;
    });
  });

  it("can extract data from image", () => {
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
    waitForLabelingImageLoaded();
    cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
    cy.get('[data-cy="labeling-page-count"]').contains("1 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("not.be.disabled");

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    evaluateSelect("originalReferenceSystem", "20104001");
    hasAiStyle("originalReferenceSystem");
    hasError("originalReferenceSystem", false);
    evaluateCoordinate("locationX", "");
    hasAiStyle("locationX");
    hasError("locationX", false);
    evaluateCoordinate("locationY", "");
    hasAiStyle("locationY");
    hasError("locationY", false);
    evaluateCoordinate("locationXLV03", "");
    hasAiStyle("locationXLV03");
    hasError("locationXLV03", false);
    isDisabled("locationXLV03");
    evaluateCoordinate("locationYLV03", "");
    hasAiStyle("locationYLV03");
    hasError("locationYLV03", false);
    isDisabled("locationYLV03");

    drawBox(400, 60, 600, 170);
    evaluateSelect("originalReferenceSystem", "20104001");
    evaluateCoordinate("locationX", "2'646'359.7");
    hasError("locationX", false);
    isDisabled("locationX", false);
    evaluateCoordinate("locationY", "1'249'017.82");
    hasError("locationY", false);
    isDisabled("locationY", false);
    evaluateCoordinate("locationXLV03", "646'358.97");
    hasError("locationXLV03", false);
    isDisabled("locationXLV03", true);
    evaluateCoordinate("locationYLV03", "249'017.66");
    hasError("locationYLV03", false);
    isDisabled("locationYLV03", true);
  });

  // TODO: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/1546
  // api call extract_data in drawBox times out
  it("can extract data from rotated and zoomed next page", () => {
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
    waitForLabelingImageLoaded();
    cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
    cy.get('[data-cy="labeling-page-count"]').contains("1 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("not.be.disabled");

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.get('[data-cy="labeling-page-next"]').click();
    waitForLabelingImageLoaded();
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

    drawBox(600, 60, 800, 170);
    evaluateSelect("originalReferenceSystem", "20104002");
    evaluateCoordinate("locationX", "2'646'466");
    hasError("locationX", false);
    isDisabled("locationX", true);
    evaluateCoordinate("locationY", "1'249'931");
    hasError("locationY", false);
    isDisabled("locationY", true);
    evaluateCoordinate("locationXLV03", "646'465");
    hasError("locationXLV03", false);
    isDisabled("locationXLV03", false);
    evaluateCoordinate("locationYLV03", "249'931");
    hasError("locationYLV03", false);
    isDisabled("locationYLV03", false);
  });

  // TODO: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/1546
  // api call extract_data in drawBox times out
  it("shows alert if no coordinates are extracted", () => {
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
    waitForLabelingImageLoaded();
    cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
    cy.get('[data-cy="labeling-page-count"]').contains("1 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("not.be.disabled");

    cy.get('[data-cy="labeling-page-next"]').click();
    waitForLabelingImageLoaded();
    cy.get('[data-cy="labeling-page-count"]').contains("3 / 3");
    cy.get('[data-cy="labeling-page-previous"]').should("not.be.disabled");
    cy.get('[data-cy="labeling-page-next"]').should("be.disabled");
    cy.wait(1000);

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    drawBox(50, 60, 400, 110);
    evaluateSelect("originalReferenceSystem", "20104002");
    evaluateCoordinate("locationX", "2'646'466");
    evaluateCoordinate("locationY", "1'249'931");
    evaluateCoordinate("locationXLV03", "646'465");
    evaluateCoordinate("locationYLV03", "249'931");

    cy.get('[data-cy="labeling-alert"]').contains("Coordinates not found.");

    // Drawing is active immediately when opening the panel with the labeling-button
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
    cy.contains("labeling_attachment.pdf").click();
    waitForLabelingImageLoaded();
    drawBox(400, 60, 600, 170);
    evaluateSelect("originalReferenceSystem", "20104001");
    evaluateCoordinate("locationX", "2'646'359.7");
    evaluateCoordinate("locationY", "1'249'017.82");
    evaluateCoordinate("locationXLV03", "646'358.97");
    evaluateCoordinate("locationYLV03", "249'017.66");
  });
});
