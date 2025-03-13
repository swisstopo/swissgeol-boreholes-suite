import { evaluateCoordinate, evaluateSelect, hasAiStyle, hasError, isDisabled } from "../helpers/formHelpers.js";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  newUneditableBorehole,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";
import "cypress-real-events/support";

const isFileActive = (fileName, isActive) => {
  cy.contains("span", fileName)
    .parents("div")
    .siblings(".MuiListItemIcon-root")
    .find("svg.lucide.lucide-check")
    .should(isActive ? "exist" : "not.exist");
};

function assertDrawTooltip(content) {
  cy.get('[data-cy="labeling-draw-tooltip"]').should("be.visible");
  cy.get('[data-cy="labeling-draw-tooltip"]').contains(content);
}

function assertDrawTooltipInvisible() {
  cy.get('[data-cy="labeling-draw-tooltip"]').should("not.visible");
}

const drawBox = (x1, y1, x2, y2) => {
  cy.wait(1000);
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x1, y: y1 });
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x2, y: y2 });

  cy.window().then(win => {
    const interactions = win.labelingImage.getInteractions().getArray();
    expect(
      interactions.some(interaction => {
        return interaction.constructor.name === "DragBox";
      }),
    ).to.be.true;
  });
  cy.get('[data-cy="labeling-panel"]')
    .realMouseDown({ position: "topLeft", x: x1, y: y1 })
    .realMouseMove(x2, y2, { position: "topLeft" })
    .realMouseUp({ position: "topLeft", x: x2, y: y2 });

  cy.wait("@extract-data");
  cy.get('[data-cy="labeling-draw-tooltip"]').should("not.be.visible");
  cy.window().then(win => {
    const interactions = win.labelingImage.getInteractions().getArray();
    expect(
      interactions.some(interaction => {
        return interaction.constructor.name === "DragBox";
      }),
    ).to.be.false;
  });
};

const waitForLabelingImageLoaded = () => {
  cy.wait("@extraction-file-info");
  cy.wait("@load-extraction-file");
  cy.window().then(win => {
    cy.wrap(win.labelingImage.getLayers().getArray()).then(layers => {
      expect(
        layers.some(layer => {
          return layer.constructor.name === "ImageLayer";
        }),
      ).to.be.true;
    });
  });
};

function assertPageCount(currentPage, totalPages) {
  cy.get('[data-cy="labeling-page-count"]').contains(`${currentPage} / ${totalPages}`);
  const previousPageDisabled = currentPage === 1;
  const nextPageDisabled = currentPage === totalPages;
  cy.get('[data-cy="labeling-page-previous"]').should(previousPageDisabled ? "be.disabled" : "not.be.disabled");
  cy.get('[data-cy="labeling-page-next"]').should(nextPageDisabled ? "be.disabled" : "not.be.disabled");
}

function toggleLabelingPanelWithoutDocuments() {
  cy.get('[data-cy="labeling-toggle-button"]').click();
  cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
  cy.get('[data-cy="labeling-file-selector"]').contains("No documents have been uploaded yet.");
}

function selectLabelingAttachment() {
  cy.get('[data-cy="labeling-file-dropzone"]').selectFile("cypress/fixtures/labeling_attachment.pdf", {
    force: true,
    mimeType: "application/pdf",
    fileName: "labeling_attachment.pdf",
  });

  cy.wait("@get-borehole-files");
  waitForLabelingImageLoaded();
  cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
}

function clickCoordinateLabelingButton() {
  cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
}

function assertLabelingAlertText(expectedText) {
  getElementByDataCy("labeling-alert")
    .invoke("text")
    .then(actualText => {
      cy.log("Actual Alert Text:", actualText); // Logs the found text in Cypress
      expect(actualText.trim()).to.equal(expectedText);
    });
}

function assertBoundingBoxes(totalCount, visibleCount) {
  cy.window().then(win => {
    const layers = win.labelingImage.getLayers().getArray();
    const boundingBoxLayer = layers.find(layer => layer.get("name") === "boundingBoxLayer");
    const features = boundingBoxLayer.getSource().getFeatures();
    const featureColors = features.map(feature => {
      const style = feature.getStyle();
      return style?.getFill()?.getColor();
    });
    expect(features.length).to.equal(totalCount); // layer always contains all bounding boxes, even if they are not visible

    const expectedColors = Array.from({ length: totalCount }, (_, i) =>
      i < visibleCount ? "rgba(91, 33, 182, 0.2)" : "transparent",
    );
    expect(featureColors).to.deep.equal(expectedColors);
  });
}

function assertClipboardContent(expectedText) {
  cy.window().should(win =>
    win.navigator.clipboard.readText().then(text => {
      expect(text).to.equal(expectedText);
    }),
  );
}

function moveMouseOntoMap() {
  cy.get('[data-cy="labeling-panel"]').realMouseMove(400, 400, { position: "topLeft" });
}

describe("Test labeling tool", () => {
  it("can show labeling panel", () => {
    goToRouteAndAcceptTerms("/");
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
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();

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

    selectInputFile("WOLFHEART.pdf", "application/pdf");

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
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    clickCoordinateLabelingButton();
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
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    drawBox(400, 140, 600, 250);
    assertBoundingBoxes(0, 0); // no bounding box preview for coordinate extraction
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

  it("can extract data from rotated and zoomed next page", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    clickCoordinateLabelingButton();
    cy.get('[data-cy="labeling-page-next"]').click();
    waitForLabelingImageLoaded();
    assertPageCount(2, 3);

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
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    drawBox(400, 120, 600, 300);
    cy.wait("@location");
    evaluateSelect("originalReferenceSystem", "20104002");
    evaluateCoordinate("locationXLV03", "646'465.97");
    hasError("locationXLV03", false);
    isDisabled("locationXLV03", false);
    evaluateCoordinate("locationYLV03", "249'931.66");
    hasError("locationYLV03", false);
    isDisabled("locationYLV03", false);
    evaluateCoordinate("locationX", "2'646'466.70");
    hasError("locationX", false);
    isDisabled("locationX", true);
    evaluateCoordinate("locationY", "1'249'931.82");
    hasError("locationY", false);
    isDisabled("locationY", true);
  });

  it("can copy text to clipboard and show word bounding box preview", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();
    selectLabelingAttachment();
    assertPageCount(1, 3);
    getElementByDataCy("labeling-page-next").click();
    waitForLabelingImageLoaded();
    assertPageCount(2, 3);
    getElementByDataCy("labeling-page-next").click();
    waitForLabelingImageLoaded();
    assertPageCount(3, 3);
    cy.wait("@extraction-file-info");
    getElementByDataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");

    // draw box around empty space
    drawBox(200, 400, 500, 500);
    assertBoundingBoxes(4, 0);
    assertLabelingAlertText("No text found");
    cy.get('button[aria-label="Close"]').click(); // close alert

    // draw box around text
    getElementByDataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
    drawBox(200, 120, 500, 400);
    assertBoundingBoxes(4, 4);
    assertLabelingAlertText('Copied to clipboard: "Some information without coo...');
    assertClipboardContent("Some information without coordinates");

    // draw box around first word and small part of second word
    getElementByDataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
    drawBox(200, 120, 250, 400);
    assertBoundingBoxes(4, 1);
    assertClipboardContent("Some");

    // can switch between text extraction and coordinate extraction
    clickCoordinateLabelingButton();
    cy.wait("@extraction-file-info");
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    getElementByDataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
  });

  it("shows alert if no coordinates are extracted", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    cy.get('[data-cy="labeling-page-next"]').click();
    cy.get('[data-cy="labeling-page-next"]').click();
    waitForLabelingImageLoaded();
    assertPageCount(3, 3);
    cy.wait(1000);

    clickCoordinateLabelingButton();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    drawBox(180, 125, 400, 185);
    assertLabelingAlertText("No coordinates found");

    // Drawing is active immediately when opening the panel with the labeling-button
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("not.exist");

    clickCoordinateLabelingButton();
    cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
  });

  it("displays warning message when fetching bounding boxes fails.", () => {
    cy.intercept("POST", "/dataextraction/api/V1/bounding_boxes", req => req.destroy());
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutDocuments();
    selectLabelingAttachment();

    cy.get(".MuiAlert-message").contains("An error occurred while fetching the bounding boxes.");
    cy.get('[aria-label="Close"]').click();
  });
});
