import Layer from "ol/layer/Layer";
import VectorSource from "ol/source/Vector";
import { evaluateInput, hasError, setInput } from "../helpers/formHelpers";
import { createBorehole, goToDetailRouteAndAcceptTerms, startBoreholeEditing } from "../helpers/testHelpers";
import { MapDomId, WindowWithMaps } from "../helpers/window.ts";

function assertBoundingBoxesOnLayer(mapDomId: MapDomId, layerName: string, shouldExist = true) {
  cy.window().should(win => {
    const window = win as WindowWithMaps;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    expect(window[mapDomId], `Map "${mapDomId}" should exist`).to.exist;
  });

  cy.window().then(win => {
    const window = win as WindowWithMaps;
    const layers = window[mapDomId]?.getLayers().getArray();
    const layer = layers?.find(l => l.get("name") === layerName) as Layer<VectorSource> | undefined;
    if (shouldExist) {
      const features = layer!.getSource()!.getFeatures();
      expect(features.length, `${layerName} should have features`).to.be.greaterThan(0);
    } else {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      expect(layer, `Layer "${layerName}" should not exist`).to.be.undefined;
    }
  });
}

function createBoreholeAndStartExtraction(boreholeName: string, filePath: string) {
  createBorehole({ originalName: boreholeName }).as("borehole_id");
  cy.get("@borehole_id").then(boreholeId => {
    goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
    cy.wait("@stratigraphy_by_borehole_GET");
    startBoreholeEditing();
    cy.dataCy("extractstratigraphyfromprofile-button").click();

    cy.get('[data-cy="addProfile-button"]')
      .find('input[type="file"]')
      .attachFile({ filePath: filePath, encoding: "binary" }, { subjectType: "input" });

    cy.wait(["@getAllAttachments", "@upload-files"]);
  });
}

describe("Tests for stratigraphy extraction", () => {
  it("Extracts stratigraphy and shows bounding boxes", () => {
    createBoreholeAndStartExtraction("SCHOOLDIONYSUS", "test_profile.pdf");
    cy.wait("@extract-stratigraphy", { timeout: 240000 }).then(interception => {
      expect(interception.response!.statusCode).to.eq(200);
      cy.get('[data-cy^="lithologicalDescription-"]:not([data-cy$="-gap"])').first().should("contain", "Humus");
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
      "@getAllAttachments",
      "@borehole_by_id",
    ]);

    cy.get('[data-cy^="lithologicalDescription-"]:not([data-cy$="-gap"])').first().should("contain", "Humus");
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
    const makeBorehole = (index: number, materialText: string, endDepth: number) => ({
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
        makeBorehole(2, "Sand", 2),
        makeBorehole(3, "Kies", 3),
        makeBorehole(4, "Ton", 4),
      ],
    };

    cy.intercept("POST", "dataextraction/api/V1/extract_stratigraphy", {
      statusCode: 200,
      body: fourBoreholeResponse,
    }).as("extract-stratigraphy-multi");

    createBoreholeAndStartExtraction("SCHOOLDIONYSUS", "2-Bohrungen.pdf");
    cy.wait("@extract-stratigraphy-multi", { timeout: 240000 });

    // With >3 stratigraphies the dropdown is shown instead of the ToggleButtonGroup.
    cy.dataCy("stratigraphy-select").should("exist");
    cy.dataCy("stratigraphy-toggle-item-0").should("not.exist");

    // First stratigraphy is selected by default; its description is visible.
    cy.dataCy("lithologicalDescription-0-1.5").should("contain", "Humus");

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
    cy.dataCy("lithologicalDescription-0-3").should("contain", "Kies");
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

  it("extracts two stratigraphies from a real profile and saves both", () => {
    createBoreholeAndStartExtraction("SCHOOLDIONYSUS", "2-Bohrungen.pdf");
    cy.wait("@extract-stratigraphy", { timeout: 240000 }).then(interception => {
      expect(interception.response!.statusCode).to.eq(200);
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

    // Save — a single combined POST carries both selected stratigraphies with their lithology contents.
    cy.dataCy("add-stratigraphy-button").click();

    cy.wait("@stratigraphy_POST", { timeout: 60000 }).then(interception => {
      // The combined create posts an array of { stratigraphy, lithology } edits.
      const edits = interception.request.body as Array<{ stratigraphy: { name?: string } }>;
      const names = edits.map(e => e.stratigraphy?.name).filter(Boolean);
      cy.log("Observed stratigraphy POST names: " + JSON.stringify(names));
      expect(names).to.include("2-Bohrungen_1");
      expect(names).to.include("2-Bohrungen_2");
    });
  });

  it("disables saving while a selected stratigraphy name is empty or duplicated", () => {
    const makeBorehole = (index: number, materialText: string, endDepth: number) => ({
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

    cy.intercept("POST", "dataextraction/api/V1/extract_stratigraphy", {
      statusCode: 200,
      body: { boreholes: [makeBorehole(1, "Humus", 1.5), makeBorehole(2, "Sand", 2)] },
    }).as("extract-stratigraphy-names");

    createBoreholeAndStartExtraction("SCHOOLDIONYSUS", "2-Bohrungen.pdf");
    cy.wait("@extract-stratigraphy-names", { timeout: 240000 });

    // Names are prefilled from the file base name with a numbered suffix.
    evaluateInput("stratigraphy-name-0", "2-Bohrungen_1");

    // Check the first (default-selected) stratigraphy: a valid name allows saving.
    cy.dataCy("add-stratigraphy-checkbox-1").click();
    cy.dataCy("add-stratigraphy-button").should("not.be.disabled");

    // Clearing a checked stratigraphy's name flags the field and blocks saving.
    setInput("stratigraphy-name-0", " ");
    hasError("stratigraphy-name-0", true);
    cy.dataCy("add-stratigraphy-button").should("be.disabled");

    // A unique name clears the error and re-enables saving.
    setInput("stratigraphy-name-0", "Alpha");
    hasError("stratigraphy-name-0", false);
    cy.dataCy("add-stratigraphy-button").should("not.be.disabled");

    // Check the second stratigraphy and give it the same name: both are flagged as not unique.
    cy.dataCy("stratigraphy-toggle-item-1").click();
    cy.dataCy("add-stratigraphy-checkbox-2").click();
    setInput("stratigraphy-name-1", "Alpha");
    hasError("stratigraphy-name-1", true);
    cy.dataCy("add-stratigraphy-button").should("be.disabled");

    // Making the second name unique again resolves the conflict.
    setInput("stratigraphy-name-1", "Beta");
    hasError("stratigraphy-name-1", false);
    cy.dataCy("add-stratigraphy-button").should("not.be.disabled");
  });

  it("displays message if nothing could be extracted from file", () => {
    createBoreholeAndStartExtraction("SCHOOLDIONYSUS", "import/borehole_attachment_3.pdf");
    cy.wait(["@extraction-file-info"]);
    cy.contains("No valid stratigraphy could be extracted from the profile");
  });

  it("navigates to the newly extracted stratigraphy after save when a primary already exists", () => {
    cy.intercept("POST", "dataextraction/api/V1/extract_stratigraphy", {
      statusCode: 200,
      body: {
        boreholes: [
          {
            id: "borehole-1",
            page_numbers: [1],
            layers: [
              {
                start: { depth: 0, bounding_boxes: [] },
                end: { depth: 5, bounding_boxes: [] },
                material_description: { text: "Sand", bounding_boxes: [] },
              },
            ],
          },
        ],
      },
    }).as("extract-stratigraphy-mock");

    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy`);
      cy.wait("@stratigraphy_by_borehole_GET");
      startBoreholeEditing();

      cy.dataCy("addemptystratigraphy-button").click();
      cy.dataCy("stratigraphy-name-formInput").type("Existing Primary");
      cy.dataCy("addemptystratigraphy-submit-button").click();
      cy.wait("@stratigraphy_POST").then(interception => {
        const created = interception.response!.body as Array<{ stratigraphy: { id: number } }>;
        cy.wrap(created[0].stratigraphy.id).as("primaryId");
      });
      cy.wait("@stratigraphy_by_borehole_GET");

      cy.dataCy("addStratigraphy-button-select").click();
      cy.dataCy("extract-button-select-item").click();
      cy.get('[data-cy="addProfile-button"]')
        .find('input[type="file"]')
        .attachFile({ filePath: "2-Bohrungen.pdf", encoding: "binary" }, { subjectType: "input" });
      cy.wait(["@getAllAttachments", "@upload-files", "@extract-stratigraphy-mock"]);

      cy.dataCy("add-stratigraphy-button").click();
      cy.wait("@stratigraphy_POST", { timeout: 60000 }).then(interception => {
        const created = interception.response!.body as Array<{ stratigraphy: { id: number } }>;
        cy.wrap(created[0].stratigraphy.id).as("extractedId");
      });

      // The URL should navigate to the newly extracted stratigraphy, not back to the primary.
      cy.get("@primaryId").then(primaryId => {
        cy.get("@extractedId").then(extractedId => {
          expect(extractedId).to.not.eq(primaryId);
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${extractedId}`);
          });
        });
      });
    });
  });
});
