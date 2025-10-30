import {
  evaluateCoordinate,
  evaluateSelect,
  hasAiStyle,
  hasError,
  isDisabled,
  setSelect,
} from "../helpers/formHelpers.js";
import {
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  newUneditableBorehole,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";
import "cypress-real-events/support";
import { getArea } from "ol/sphere.js";
import { discardChanges, saveForm } from "../helpers/buttonHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";

const isFileActive = (fileName, isActive) => {
  cy.contains("span", fileName)
    .parents("div")
    .siblings(".MuiListItemIcon-root")
    .find("svg.lucide.lucide-check")
    .should(isActive ? "exist" : "not.exist");
};

const assertSelectContent = fileNames => {
  cy.get('[data-cy*="button-select-item"]').should("have.length", fileNames.length);
  fileNames.forEach(fileName => {
    cy.get('[data-cy*="button-select-item"]').contains(fileName).should("exist");
  });
};

function assertDrawTooltip(content) {
  cy.get('[data-cy="labeling-draw-tooltip"]').should("be.visible");
  cy.get('[data-cy="labeling-draw-tooltip"]').contains(content);
}

function assertDrawTooltipInvisible() {
  cy.get('[data-cy="labeling-draw-tooltip"]').should("not.be.visible");
}

const drawBox = (x1, y1, x2, y2) => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x1, y: y1 });
  cy.get('[data-cy="labeling-panel"]').trigger("pointerdown", { x: x2, y: y2 });

  cy.window().then(win => {
    const interactions = win.labelingImage.getInteractions().getArray();
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
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

function toggleLabelingPanelWithoutProfiles() {
  cy.get('[data-cy="labeling-toggle-button"]').click();
  cy.get('[data-cy="labeling-file-dropzone"]').should("exist");
  cy.get('[data-cy="labeling-file-selector"]').contains("No profile has been uploaded yet.");
}

function selectLabelingAttachment() {
  cy.get('[data-cy="labeling-file-dropzone"]').selectFile("cypress/fixtures/labeling_attachment.pdf", {
    force: true,
    mimeType: "application/pdf",
    fileName: "labeling_attachment.pdf",
  });

  cy.wait("@getAllAttachments");
  waitForLabelingImageLoaded();
  cy.get('[data-cy="labeling-file-button-select"]').contains("labeling_attachment.pdf");
}

function clickCoordinateLabelingButton() {
  cy.get('[data-cy="coordinate-segment"] [data-cy="labeling-button"]').click();
}

function assertLabelingAlertText(expectedText) {
  cy.dataCy("labeling-alert")
    .invoke("text")
    .then(actualText => {
      cy.log("Actual Alert Text:", actualText); // Logs the found text in Cypress
      expect(actualText.trim()).to.equal(expectedText);
    });
}

function assertBoundingBoxes(totalCount, highlightedArea) {
  cy.window().then(win => {
    const layers = win.labelingImage.getLayers().getArray();
    const boundingBoxLayer = layers.find(layer => layer.get("name") === "boundingBoxLayer");
    const highlightsLayer = layers.find(layer => layer.get("name") === "highlightsLayer");
    const invisibleBoundingBoxes = boundingBoxLayer.getSource().getFeatures();
    const highlights = highlightsLayer.getSource().getFeatures();
    expect(invisibleBoundingBoxes.length).to.equal(totalCount); // layer always contains all bounding boxes, even if they are not visible
    expect(highlights.length).to.equal(highlightedArea === 0 ? 0 : 1); // highlights are combined into one feature
    if (highlightedArea !== 0) {
      expect(Math.round(Math.abs(getArea(highlights[0].getGeometry())))).to.equal(highlightedArea);
    }
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
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
  cy.get('[data-cy="labeling-panel"]').realMouseMove(400, 400, { position: "topLeft" });
}

function openPanel() {
  cy.dataCy("labeling-toggle-button").click();
  cy.get('[data-cy="labeling-panel"]').should("exist");
}

function closePanel() {
  cy.dataCy("labeling-toggle-button").click();
  cy.get('[data-cy="labeling-panel"]').should("not.exist");
}

function selectEmptyPhotoTab() {
  cy.dataCy("labeling-tab-photo").click();
  cy.dataCy("labeling-file-selector").contains("No photo has been uploaded yet.");
}

function uploadPhoto() {
  cy.get('[data-cy="addPhoto-button"]').find('input[type="file"]').attachFile("import/image_12.0-34.0_all.tif", {
    subjectType: "input",
  });
  cy.wait("@upload-photo");
  cy.wait("@getAllPhotos");
}

function reloadPanel() {
  closePanel();
  openPanel();
}

describe("Test labeling tool", () => {
  it("can show labeling panel ", () => {
    goToRouteAndAcceptTerms("/");
    newUneditableBorehole().as("borehole_id");

    // panel is closed by default
    startBoreholeEditing();
    cy.dataCy("labeling-toggle-button").should("exist");
    cy.dataCy("labeling-panel").should("not.exist");
    // panel can be opened and closed
    openPanel();
    closePanel();

    //  panel position should be preserved when editing is stopped
    cy.get('[data-cy="labeling-toggle-button"]').click();
    cy.get('[data-cy="labeling-panel"]').should("exist");
    cy.get('[data-cy="labeling-panel-position-right"]').should("have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').click();
    cy.get('[data-cy="labeling-panel-position-right"]').should("not.have.class", "Mui-selected");
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");

    stopBoreholeEditing();
    // panel stays open when editing stops
    cy.dataCy("labeling-toggle-button").should("exist");
    cy.dataCy("labeling-panel").should("exist");
    closePanel();
    openPanel();
    cy.get('[data-cy="labeling-panel-position-bottom"]').should("have.class", "Mui-selected");
  });

  it("can select file", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();

    cy.dataCy("labeling-file-dropzone").attachFile("import/borehole_attachment_1.pdf", {
      subjectType: "drag-n-drop",
    });
    cy.wait(["@getAllAttachments", "@upload-files", "@borehole_by_id"]);
    cy.dataCy("labeling-file-button-select").contains("borehole_attachment_1.pdf");

    reloadPanel();
    cy.wait(["@getAllAttachments"]);
    cy.dataCy("labeling-file-selector").should("not.exist");
    cy.dataCy("labeling-file-button-select").contains("borehole_attachment_1.pdf");

    // Simulate file upload using Add profile in labeling-file-button-select
    cy.dataCy("labeling-panel").find('input[type="file"]').attachFile("import/borehole_attachment_3.pdf", {
      subjectType: "input",
    });
    cy.wait("@getAllAttachments");
    cy.get('[data-cy="labeling-file-button-select"]').contains("borehole_attachment_3.pdf");
    cy.get('[data-cy="labeling-file-button-select"]').click();
    assertSelectContent(["borehole_attachment_1.pdf", "borehole_attachment_3.pdf", "Add profile"]);

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
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(interactions.some(interaction => interaction.constructor.name === "Draw")).to.be.false;
    });
    stopBoreholeEditing();
    cy.dataCy("editingstop-button").should("not.exist");
    cy.dataCy("edit-button").should("be.visible");
    cy.dataCy("labeling-toggle-button").should("exist");
    cy.dataCy("labeling-panel").should("exist");

    cy.dataCy("text-extraction-button").should("not.exist");

    //can zoom and rotate
    cy.get('[data-cy="labeling-panel"] [data-cy="zoom-in-button"]').click();
    cy.get('[data-cy="rotate-button"]').click();
    cy.window().then(win => {
      const view = win.labelingImage.getView();
      expect(view.getRotation()).to.equal(Math.PI / 2);
    });

    cy.dataCy("labeling-file-button-select").click();
    assertSelectContent(["borehole_attachment_1.pdf", "borehole_attachment_3.pdf", "WOLFHEART.pdf"]);
    cy.contains("Add profile").should("not.exist");
    // can select different file from dropdown
    cy.get(".MuiListItem-root").contains("WOLFHEART.pdf").click();
    cy.dataCy("labeling-file-button-select").contains("WOLFHEART.pdf");

    reloadPanel();
    cy.dataCy("labeling-file-selector").contains("Profiles").should("exist");
    cy.dataCy("addfile-button").should("not.exist");
    cy.dataCy("file-button").contains("borehole_attachment_1.pdf");
    cy.dataCy("file-button").contains("borehole_attachment_3.pdf");
    cy.dataCy("file-button").contains("WOLFHEART.pdf");
    cy.dataCy("file-button").contains("borehole_attachment_3.pdf").click();
    waitForLabelingImageLoaded();
  });

  it("can extract coordinates and reference system from image", () => {
    function assertInputsHaveAiStyle() {
      hasAiStyle("originalReferenceSystem");
      hasAiStyle("locationX");
      hasAiStyle("locationY");
      hasAiStyle("locationXLV03");
      hasAiStyle("locationYLV03");
    }

    function assertInputsHaveNormalStyle() {
      hasAiStyle("originalReferenceSystem", false);
      hasAiStyle("locationX", false);
      hasAiStyle("locationY", false);
      hasAiStyle("locationXLV03", false);
      hasAiStyle("locationYLV03", false);
    }

    function assertInputsHaveNoError() {
      hasError("originalReferenceSystem", false);
      hasError("locationX", false);
      hasError("locationY", false);
      hasError("locationXLV03", false);
      hasError("locationYLV03", false);
    }

    function assertEmptyInputsForLV95HaveError() {
      hasError("locationX", true);
      hasError("locationY", true);
    }

    function assertLV03InputsAreDisabled() {
      isDisabled("locationXLV03", true);
      isDisabled("locationYLV03", true);
      isDisabled("locationX", false);
      isDisabled("locationY", false);
    }

    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    // assert initial form styles
    assertInputsHaveNormalStyle();
    assertEmptyInputsForLV95HaveError();

    clickCoordinateLabelingButton();
    assertInputsHaveAiStyle();
    assertInputsHaveNoError();
    evaluateSelect("originalReferenceSystem", "LV95");
    evaluateCoordinate("locationX", "");
    evaluateCoordinate("locationY", "");
    evaluateCoordinate("locationXLV03", "");
    evaluateCoordinate("locationYLV03", "");
    assertLV03InputsAreDisabled();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    drawBox(400, 140, 600, 250);
    cy.wait(["@location", "@location", "@location", "@geodesy", "@geodesy"]);
    assertBoundingBoxes(0, 0); // no bounding box preview for coordinate extraction
    evaluateSelect("originalReferenceSystem", "LV95");
    assertInputsHaveNoError();
    assertLV03InputsAreDisabled();
    evaluateCoordinate("locationX", "2'646'359.7");
    evaluateCoordinate("locationY", "1'249'017.82");
    evaluateCoordinate("locationXLV03", "646'358.97");
    evaluateCoordinate("locationYLV03", "249'017.66");

    // wait for end of map animation before proceeding
    cy.window().then(win => {
      const view = win.pointOlMap.getView();
      const resolution = view.getResolution();
      cy.wrap(resolution).as("resolution");
    });
    cy.get("@resolution").then(resolution => {
      expect(resolution).to.equal(1);
    });

    // can reset the form
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000); // otherwise test is flaky ¯\_(ツ)_/¯
    discardChanges();
    assertInputsHaveNormalStyle();
    assertEmptyInputsForLV95HaveError();
    assertLV03InputsAreDisabled();
    evaluateSelect("originalReferenceSystem", "LV95");
    evaluateCoordinate("locationX", "");
    evaluateCoordinate("locationY", "");
    evaluateCoordinate("locationXLV03", "");
    evaluateCoordinate("locationYLV03", "");
  });

  it("can extract coordinates and reference system from rotated and zoomed next page", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    clickCoordinateLabelingButton();

    // can navigate with pagination
    cy.get('[data-cy="labeling-page-last"]').click();
    waitForLabelingImageLoaded();
    assertPageCount(3, 3);

    cy.get('[data-cy="labeling-page-first"]').click();
    waitForLabelingImageLoaded();
    assertPageCount(1, 3);

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
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-cy="labeling-panel"] [data-cy="zoom-in-button"]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    drawBox(400, 120, 600, 300);
    cy.wait("@location");
    evaluateSelect("originalReferenceSystem", "LV03");
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

  it("can copy text to clipboard and show word bounding box previews", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();
    selectLabelingAttachment();
    assertPageCount(1, 3);
    cy.dataCy("labeling-page-next").click();
    waitForLabelingImageLoaded();
    assertPageCount(2, 3);
    cy.dataCy("labeling-page-next").click();
    waitForLabelingImageLoaded();
    assertPageCount(3, 3);
    cy.wait("@extraction-file-info");
    cy.dataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");

    // draw box around empty space
    drawBox(200, 400, 500, 500);
    assertBoundingBoxes(4, 0);
    assertLabelingAlertText("No text found");
    cy.get('button[aria-label="Close"]').click(); // close alert

    // draw box around text
    cy.dataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
    drawBox(200, 120, 500, 400);
    assertBoundingBoxes(4, 17227);
    assertLabelingAlertText('Copied to clipboard: "Some information without coo...');
    assertClipboardContent("Some information without coordinates");

    // draw box around first word and small part of second word
    cy.dataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
    drawBox(200, 120, 250, 400);
    assertBoundingBoxes(4, 3957);
    assertClipboardContent("Some");

    // can switch between text extraction and coordinate extraction
    clickCoordinateLabelingButton();
    cy.wait("@extraction-file-info");
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around north & east coordinates");
    cy.dataCy("text-extraction-button").click();
    assertDrawTooltipInvisible();
    moveMouseOntoMap();
    assertDrawTooltip("Draw box around any text");
  });

  it("shows alert if no coordinates are extracted", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();
    selectLabelingAttachment();
    assertPageCount(1, 3);

    cy.get('[data-cy="labeling-page-next"]').click();
    cy.get('[data-cy="labeling-page-next"]').click();
    waitForLabelingImageLoaded();
    assertPageCount(3, 3);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
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
    toggleLabelingPanelWithoutProfiles();
    selectLabelingAttachment();

    cy.get(".MuiAlert-message").contains("An error occurred while fetching the bounding boxes.");
    cy.get('[aria-label="Close"]').click();
  });

  it("can upload and show photos", () => {
    goToRouteAndAcceptTerms("/");
    newEditableBorehole().as("borehole_id");
    toggleLabelingPanelWithoutProfiles();
    selectEmptyPhotoTab();

    cy.dataCy("labeling-file-selector-manage-photos").click();
    cy.location()
      .its("href")
      .should("match", /\/attachments#photos$/);

    uploadPhoto();
    reloadPanel();

    cy.dataCy("labeling-file-selector").should("not.exist");
    cy.dataCy("labeling-file-button-select").contains("12.00 - 34.00");

    // text extraction is not available for photos
    cy.dataCy("text-extraction-button").should("not.exist");

    // can zoom and rotate
    cy.dataCy("zoom-in-button").click();
    cy.dataCy("rotate-button").click();
    cy.window().then(win => {
      const view = win.labelingImage.getView();
      expect(view.getRotation()).to.equal(Math.PI / 2);
    });

    cy.dataCy("labeling-panel")
      .find('input[type="file"]')
      .attachFile({
        fileContent: new Blob([0]),
        fileName: "image_123.0-456.0_all.jpg",
        mimeType: "image/jpeg",
      });
    cy.wait(["@upload-photo", "@getAllPhotos"]);
    stopBoreholeEditing();

    // can navigate with previous button
    cy.dataCy("labeling-file-button-select").contains("123.00 - 456.00");
    cy.dataCy("labeling-page-previous").click();
    cy.dataCy("labeling-file-button-select").contains("12.00 - 34.00");

    // can search in photo select list
    cy.dataCy("labeling-file-button-select").click();
    assertSelectContent(["12.00 - 34.00", "123.00 - 456.00"]);
    cy.dataCy("labeling-file-button-select-search").type("456");
    assertSelectContent(["123.00 - 456.00"]);

    // can save other changes on a borehole with photos
    cy.dataCy("labeling-tab-profile").click({ force: true }); // close select
    cy.dataCy("labeling-toggle-button").click();
    navigateInSidebar(SidebarMenuItem.borehole);
    startBoreholeEditing();
    setSelect("purposeId", 1);
    saveForm();
    stopBoreholeEditing();
  });
});
