/* eslint-disable @typescript-eslint/no-explicit-any */
import { createBorehole, goToDetailRouteAndAcceptTerms, startBoreholeEditing } from "../helpers/testHelpers";

function assertBoundingBoxesOnLayer(mapDomId: string, layerName: string, shouldExist = true) {
  cy.window().should(win => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect((win as Record<string, any>)[mapDomId], `Map "${mapDomId}" should exist`).to.exist;
  });

  cy.window().then(win => {
    const layers = (win as Record<string, any>)[mapDomId].getLayers().getArray();
    const layer = layers.find((layer: any) => layer.get("name") === layerName);
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
      goToDetailRouteAndAcceptTerms(`/${boreholeId as unknown as number}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "test_profile.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files"]);
    });
    cy.wait("@extract-stratigraphy", { timeout: 240000 }).then(interception => {
      expect(interception.response!.statusCode).to.eq(200);
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

  it("shows dropdown and supports check/uncheck for multiple extracted stratigraphies", () => {
    // Build a mock response with 4 boreholes to trigger the dropdown UI (threshold is > 3).
    const makeBorehole = (index, materialText, endDepth) => ({
      id: `borehole-${index}`,
      page_numbers: [1],
      layers: [
        {
          start: { depth: 0, bounding_boxes: [] },
          end: { depth: endDepth, bounding_boxes: [] },
          material_description: { text: materialText, bounding_boxes: [] },
        },
      ],
    });

    const fourBoreholeResponse = {
      boreholes: [
        makeBorehole(1, "Humus", 1.5),
        makeBorehole(2, "Sand", 2.0),
        makeBorehole(3, "Kies", 3.0),
        makeBorehole(4, "Ton", 4.0),
      ],
    };

    cy.intercept("POST", "dataextraction/api/V1/extract_stratigraphy", {
      statusCode: 200,
      body: fourBoreholeResponse,
    }).as("extract-stratigraphy-multi");

    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "2-Bohrungen.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files"]);
    });

    cy.wait("@extract-stratigraphy-multi", { timeout: 240000 });

    // With >3 stratigraphies the dropdown is shown instead of the ToggleButtonGroup.
    cy.dataCy("stratigraphy-select").should("exist");
    cy.dataCy("stratigraphy-toggle-item-0").should("not.exist");

    // First stratigraphy is selected by default; its description is visible.
    cy.dataCy("extracted_lithologicalDescription-0").should("contain", "Humus");

    // Footer checkbox targets the currently selected stratigraphy and starts unchecked.
    cy.dataCy("add-stratigraphy-checkbox-1").find('input[type="checkbox"]').should("not.be.checked");
    cy.dataCy("add-stratigraphy-button").should("be.disabled");

    // Check stratigraphy 1.
    cy.dataCy("add-stratigraphy-checkbox-1").click();
    cy.dataCy("add-stratigraphy-checkbox-1").find('input[type="checkbox"]').should("be.checked");
    cy.dataCy("add-stratigraphy-button").should("not.be.disabled");

    // Switch to stratigraphy 3 via the dropdown; preview and checkbox update.
    cy.dataCy("stratigraphy-select").click();
    cy.dataCy("stratigraphy-select-item-2").click();
    cy.dataCy("extracted_lithologicalDescription-0").should("contain", "Kies");
    cy.dataCy("add-stratigraphy-checkbox-3").find('input[type="checkbox"]').should("not.be.checked");

    // Check stratigraphy 3; button count should reflect two checked.
    cy.dataCy("add-stratigraphy-checkbox-3").click();
    cy.dataCy("add-stratigraphy-checkbox-3").find('input[type="checkbox"]').should("be.checked");
    cy.dataCy("add-stratigraphy-button").should("contain", "2");

    // Uncheck stratigraphy 3; count goes back to one.
    cy.dataCy("add-stratigraphy-checkbox-3").click();
    cy.dataCy("add-stratigraphy-checkbox-3").find('input[type="checkbox"]').should("not.be.checked");
    cy.dataCy("add-stratigraphy-button").should("not.contain", "2");
    cy.dataCy("add-stratigraphy-button").should("not.be.disabled");

    // Switching back to stratigraphy 1 still shows it as checked (per-index state persists).
    cy.dataCy("stratigraphy-select").click();
    cy.dataCy("stratigraphy-select-item-0").click();
    cy.dataCy("add-stratigraphy-checkbox-1").find('input[type="checkbox"]').should("be.checked");
  });

  it("extracts two stratigraphies from a real profile, saves both, and shows the success alert", () => {
    cy.intercept("POST", "/api/v2/stratigraphy").as("stratigraphy_POST");

    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();
      cy.dataCy("extractstratigraphyfromprofile-button").click();

      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "2-Bohrungen.pdf", encoding: "binary" }, { subjectType: "input" });

      cy.wait(["@getAllAttachments", "@upload-files"]);
    });

    cy.wait("@extract-stratigraphy", { timeout: 240000 }).then(interception => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // With exactly 2 stratigraphies the ToggleButtonGroup (not the dropdown) is rendered.
    cy.dataCy("stratigraphy-toggle-item-0").should("exist");
    cy.dataCy("stratigraphy-toggle-item-1").should("exist");
    cy.dataCy("stratigraphy-toggle-item-2").should("not.exist");
    cy.dataCy("stratigraphy-select").should("not.exist");

    // Check the first stratigraphy (selected by default).
    cy.dataCy("add-stratigraphy-checkbox-1").click();
    cy.dataCy("add-stratigraphy-checkbox-1").find('input[type="checkbox"]').should("be.checked");

    // Switch to the second stratigraphy and check it.
    cy.dataCy("stratigraphy-toggle-item-1").click();
    cy.dataCy("add-stratigraphy-checkbox-2").find('input[type="checkbox"]').should("not.be.checked");
    cy.dataCy("add-stratigraphy-checkbox-2").click();
    cy.dataCy("add-stratigraphy-checkbox-2").find('input[type="checkbox"]').should("be.checked");

    // Button label reflects both being checked.
    cy.dataCy("add-stratigraphy-button").should("contain", "2");

    // Save — two stratigraphy POSTs should fire, one per selected stratigraphy.
    cy.dataCy("add-stratigraphy-button").click();

    // Pluralized success alert confirms both were saved; asserting the alert also
    // implicitly waits for both POSTs to finish (bulkAdd calls them sequentially).
    cy.get(".MuiAlert-message", { timeout: 60000 }).should("contain", "2 stratigraphies successfully saved.");

    // Verify both POSTs were made with the expected per-index names.
    cy.get("@stratigraphy_POST.all").then(interceptions => {
      const names = interceptions.map(i => i.request.body?.name).filter(Boolean);
      cy.log("Observed stratigraphy POST names: " + JSON.stringify(names));
      expect(names).to.include("2-Bohrungen_1");
      expect(names).to.include("2-Bohrungen_2");
    });
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
