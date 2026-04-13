import { createBorehole, goToDetailRouteAndAcceptTerms, startBoreholeEditing } from "../helpers/testHelpers";

function assertBoundingBoxesOnLayer(mapDomId, layerName, shouldExist = true) {
  cy.window().should(win => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(win[mapDomId], `Map "${mapDomId}" should exist`).to.exist;
  });

  cy.window().then(win => {
    const layers = win[mapDomId].getLayers().getArray();
    const layer = layers.find(layer => layer.get("name") === layerName);
    if (shouldExist) {
      const features = layer.getSource().getFeatures();
      expect(features.length, `${layerName} should have features`).to.be.greaterThan(0);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(layer, `Layer "${layerName}" should not exist`).to.be.undefined;
    }
  });
}

describe("Tests for stratigraphy extraction", () => {
  it("Extracts stratigraphy and shows bounding boxes", () => {
    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "test_profile.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files"]);
    });
    cy.wait("@extract-stratigraphy", { timeout: 240000 }).then(interception => {
      expect(interception.response.statusCode).to.eq(200);
      cy.dataCy("extracted_lithologicalDescription-0").should("contain", "Humus");
      cy.get(`#extraction-map`).within(() => {
        cy.get("canvas, svg").should("exist");
      });
      // Wait for layers to be fully rendered
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(2000);
      assertBoundingBoxesOnLayer("extraction-map", "highlightDescriptionsLayer", true);
      assertBoundingBoxesOnLayer("extraction-map", "highlightDepthLayer", true);
    });
    cy.dataCy("add-stratigraphy-button").click();
    cy.wait([
      "@stratigraphy_by_borehole_GET",
      "@lithology_by_stratigraphyId_GET",
      "@lithologicaldescription_by_stratigraphyId_GET",
      "@getAllAttachments",
      "@borehole_by_id",
    ]);

    cy.dataCy("lithologicalDescription-0").should("contain", "Humus");
    cy.dataCy("labeling-toggle-button").click();
    cy.get(`#labeling-map`).within(() => {
      cy.get("canvas, svg").should("exist");
    });
    // Wait for layers to be fully rendered
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);
    assertBoundingBoxesOnLayer("labeling-map", "highlightDescriptionsLayer", false);
    assertBoundingBoxesOnLayer("labeling-map", "highlightDepthLayer", false);
  });

  it("supports selecting and saving multiple extracted stratigraphies", () => {
    const twoBoreholeResponse = {
      boreholes: [
        {
          id: "borehole-1",
          layers: [
            {
              start: { depth: 0, bounding_boxes: [] },
              end: { depth: 1.5, bounding_boxes: [] },
              material_description: { text: "Humus", bounding_boxes: [] },
            },
          ],
        },
        {
          id: "borehole-2",
          layers: [
            {
              start: { depth: 0, bounding_boxes: [] },
              end: { depth: 2.0, bounding_boxes: [] },
              material_description: { text: "Sand", bounding_boxes: [] },
            },
          ],
        },
      ],
    };

    cy.intercept("POST", "dataextraction/api/V1/extract_stratigraphy", {
      statusCode: 200,
      body: twoBoreholeResponse,
    }).as("extract-stratigraphy-multi");

    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "test_profile.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files"]);
    });

    cy.wait("@extract-stratigraphy-multi");

    // dropdown is visible when multiple stratigraphies are extracted
    cy.dataCy("stratigraphy-selector").should("exist");

    // both checkboxes are checked by default
    cy.dataCy("stratigraphy-selector").click();
    cy.dataCy("stratigraphy-selector-checkbox-0").find('input[type="checkbox"]').should("be.checked");
    cy.dataCy("stratigraphy-selector-checkbox-1").find('input[type="checkbox"]').should("be.checked");

    // button label reflects total count
    cy.dataCy("add-stratigraphy-button").should("contain", "2");

    // uncheck the second stratigraphy
    cy.dataCy("stratigraphy-selector-checkbox-1").click();
    cy.get("body").type("{esc}"); // close the dropdown
    cy.dataCy("add-stratigraphy-button").should("contain", "stratigraphy").and("not.contain", "2");

    // save: only one stratigraphy POST should be made
    cy.dataCy("add-stratigraphy-button").click();
    cy.wait("@stratigraphy_POST").then(interception => {
      expect(interception.request.body.name).to.match(/^Extracted_test_profile_1$/);
    });

    cy.wait([
      "@stratigraphy_by_borehole_GET",
      "@lithology_by_stratigraphyId_GET",
      "@lithologicaldescription_by_stratigraphyId_GET",
    ]);

    // snackbar confirmation is shown
    cy.get(".MuiAlert-message").should("contain", "Stratigraphy successfully saved.");
  });

  it("displays message if nothing could be extracted from file", () => {
    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();
      cy.dataCy("addProfile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "import/borehole_attachment_3.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files", "@extraction-file-info"]);
      cy.contains("No valid stratigraphy could be extracted from the profile");
    });
  });
});
