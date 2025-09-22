import {
  addStratigraphy,
  discardChanges,
  saveForm,
  saveWithSaveBar,
  verifyNoUnsavedChanges,
  verifyUnsavedChanges,
} from "../helpers/buttonHelpers";
import {
  evaluateCheckbox,
  evaluateInput,
  evaluateSelect,
  hasError,
  setInput,
  setSelect,
  toggleCheckbox,
} from "../helpers/formHelpers.js";
import {
  checkTabsByTitles,
  navigateInSidebar,
  navigateToTabWithTitle,
  SidebarMenuItem,
} from "../helpers/navigationHelpers.js";
import {
  createBorehole,
  createStratigraphyV2,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  goToRouteAndAcceptTerms,
  handlePrompt,
  newUneditableBorehole,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for stratigraphy", () => {
  it("shows add buttons when no stratigraphies are available", () => {
    goToRouteAndAcceptTerms(`/?dev=true`);
    newUneditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.wait("@stratigraphyV2_by_borehole_GET");
    cy.contains("No stratigraphies available...");
    startBoreholeEditing();
    cy.contains("button", "Create empty stratigraphy").should("be.visible").and("be.enabled");
    cy.contains("button", "Extract stratigraphy from profile").should("be.visible").and("be.enabled");
  });

  it("starts stratigraphy extraction", () => {
    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
      cy.wait("@stratigraphyV2_by_borehole_GET");
      startBoreholeEditing();
      getElementByDataCy("extractstratigraphyfromprofile-button").click();
      getElementByDataCy("addProfile-button").click();

      cy.get('input[type="file"]').attachFile("labeling_attachment.pdf");
      cy.wait("@extract-stratigraphy").then(interception => {
        expect(interception.response.statusCode).to.eq(200);
      });
    });
  });

  it("adds and updates stratigraphies, and sorts them based on isPrimary state and alphabetic order", () => {
    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
      cy.wait("@stratigraphyV2_by_borehole_GET");
      startBoreholeEditing();

      getElementByDataCy("addemptystratigraphy-button").click();
      cy.location().should(location => {
        expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
      });
      setInput("name", "First Stratigraphy");
      getElementByDataCy("stratigraphy-header").contains("First Stratigraphy").should("not.exist");
      getElementByDataCy("isPrimary-formCheckbox").should("not.exist");
      saveWithSaveBar();
      cy.wait("@stratigraphyV2_POST").then(interception => {
        cy.wait("@stratigraphyV2_by_borehole_GET");

        const firstStratigraphy = interception.response.body;
        // Should redirect to the newly created stratigraphy after saving
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${firstStratigraphy.id}`);
        });

        // Shows the title after saving
        getElementByDataCy("stratigraphy-header").contains("First Stratigraphy").should("exist");
        getElementByDataCy("delete-button").should("exist");
        getElementByDataCy("duplicate-button").should("exist");

        // Shows tabs when more than one stratigraphy is available
        addStratigraphy();
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
        });
        getElementByDataCy("stratigraphy-header").should("not.exist");
        checkTabsByTitles(
          [{ title: "First Stratigraphy" }, { title: "Not specified", active: true }],
          null,
          "stratigraphy-tab",
        );

        setInput("name", "First Stratigraphy");
        checkTabsByTitles(
          [{ title: "First Stratigraphy" }, { title: "Not specified", active: true }],
          null,
          "stratigraphy-tab",
        );
        evaluateCheckbox("isPrimary", false);
        saveForm();
        verifyUnsavedChanges();
        hasError("name");
        setInput("name", "Another Stratigraphy");
        hasError("name", false);
        saveWithSaveBar();

        cy.wait(["@stratigraphyV2_POST", "@stratigraphyV2_by_borehole_GET"]);
        cy.location().should(location => {
          expect(location.pathname).not.to.contain(`stratigraphy/new`);
        });
        checkTabsByTitles(
          [{ title: "First Stratigraphy" }, { title: "Another Stratigraphy", active: true }],
          null,
          "stratigraphy-tab",
        );
        evaluateInput("name", "Another Stratigraphy");
        evaluateCheckbox("isPrimary", false);
        navigateToTabWithTitle("First Stratigraphy");
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${firstStratigraphy.id}`);
        });
        checkTabsByTitles(
          [{ title: "First Stratigraphy", active: true }, { title: "Another Stratigraphy" }],
          null,
          "stratigraphy-tab",
        );
        evaluateInput("name", "First Stratigraphy");
        evaluateCheckbox("isPrimary", true);

        addStratigraphy();
        checkTabsByTitles(
          [
            { title: "First Stratigraphy" },
            { title: "Another Stratigraphy" },
            { title: "Not specified", active: true },
          ],
          null,
          "stratigraphy-tab",
        );
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
        });
        setInput("name", "Primary Stratigraphy");
        setInput("date", "2024-03-20");
        toggleCheckbox("isPrimary");
        saveWithSaveBar();
        cy.wait(["@stratigraphyV2_POST", "@stratigraphyV2_by_borehole_GET"]);
        checkTabsByTitles(
          [
            { title: "Primary Stratigraphy", active: true },
            { title: "Another Stratigraphy" },
            { title: "First Stratigraphy" },
          ],
          null,
          "stratigraphy-tab",
        );
        evaluateInput("name", "Primary Stratigraphy");
        evaluateInput("date", "2024-03-20");
        evaluateCheckbox("isPrimary", true);

        navigateToTabWithTitle("First Stratigraphy");
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${firstStratigraphy.id}`);
        });
        checkTabsByTitles(
          [
            { title: "Primary Stratigraphy" },
            { title: "Another Stratigraphy" },
            { title: "First Stratigraphy", active: true },
          ],
          null,
          "stratigraphy-tab",
        );
        evaluateCheckbox("isPrimary", false);
        setInput("date", "2025-01-01");
        setInput("name", "Another Stratigraphy");
        saveForm();
        verifyUnsavedChanges();
        hasError("name");
        setInput("name", "First Stratigraphy updated");
        hasError("name", false);
        saveWithSaveBar();
        cy.wait(["@stratigraphyV2_PUT", "@stratigraphyV2_by_borehole_GET"]);
        goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy/${firstStratigraphy.id}?dev=true`);
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${firstStratigraphy.id}`);
        });
        cy.wait("@stratigraphyV2_by_borehole_GET");
        checkTabsByTitles(
          [
            { title: "Primary Stratigraphy" },
            { title: "Another Stratigraphy" },
            { title: "First Stratigraphy updated", active: true },
          ],
          null,
          "stratigraphy-tab",
        );
        evaluateInput("name", "First Stratigraphy updated");
        evaluateInput("date", "2025-01-01");
        evaluateCheckbox("isPrimary", false);
      });
    });
  });

  it("can copy existing stratigraphy", () => {
    createBorehole({ originalName: "OLYMPIAGOAT" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphyV2(boreholeId, "OLYMPIAGOAT").as("stratigraphy_id");
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
        cy.wait(["@stratigraphyV2_by_borehole_GET", "@lithology_by_stratigraphyId_GET"]);
        startBoreholeEditing();

        // Should redirect to primary stratigraphy if no stratigraphy is selected
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${stratigraphyId}`);
        });

        // Can duplicate existing stratigraphy
        getElementByDataCy("duplicate-button").click();
        cy.wait("@stratigraphyV2_COPY").then(interception => {
          cy.wait(["@stratigraphyV2_by_borehole_GET", "@lithology_by_stratigraphyId_GET"]);
          const copiedStratigraphyId = interception.response.body;
          // Should redirect to the copied stratigraphy
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${copiedStratigraphyId}`);
          });
          checkTabsByTitles(
            [{ title: "OLYMPIAGOAT" }, { title: "OLYMPIAGOAT (Clone)", active: true }],
            null,
            "stratigraphy-tab",
          );
          evaluateInput("name", "OLYMPIAGOAT (Clone)");
          evaluateCheckbox("isPrimary", false);
        });
      });
    });
  });

  it("can delete stratigraphies", () => {
    createBorehole({ originalName: "AIRGIRAFFE" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphyV2(boreholeId, "BATONTRUCK").as("stratigraphy_id_1");
      cy.get("@stratigraphy_id_1").then(stratigraphyId1 => {
        createStratigraphyV2(boreholeId, "GATETRUCK", false).as("stratigraphy_id_2");
        cy.get("@stratigraphy_id_2").then(stratigraphyId2 => {
          goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
          cy.wait(["@stratigraphyV2_by_borehole_GET", "@lithology_by_stratigraphyId_GET"]);

          // Should redirect to primary stratigraphy if no stratigraphy is selected
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${stratigraphyId1}`);
          });
          checkTabsByTitles([{ title: "BATONTRUCK", active: true }, { title: "GATETRUCK" }], null, "stratigraphy-tab");
          startBoreholeEditing();

          // Cannot delete primary stratigraphy if multiple stratigraphies are available
          evaluateCheckbox("isPrimary", true);
          getElementByDataCy("delete-button").should("be.disabled").parent().trigger("mouseover");
          cy.contains("The main stratigraphy cannot be deleted.").should("be.visible");

          navigateToTabWithTitle("GATETRUCK");
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${stratigraphyId2}`);
          });
          checkTabsByTitles([{ title: "BATONTRUCK" }, { title: "GATETRUCK", active: true }], null, "stratigraphy-tab");
          evaluateCheckbox("isPrimary", false);
          getElementByDataCy("delete-button").click();
          handlePrompt(
            "Do you really want to delete this entry? The entry will be permanently deleted from the database.",
            "delete",
          );
          cy.wait(["@stratigraphyV2_DELETE", "@stratigraphyV2_by_borehole_GET", "@lithology_by_stratigraphyId_GET"]);
          cy.contains("GATETRUCK").should("not.exist");
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${stratigraphyId1}`);
          });

          getElementByDataCy("stratigraphy-header").contains("BATONTRUCK").should("exist");
          getElementByDataCy("delete-button").should("be.enabled");
          getElementByDataCy("delete-button").click();
          handlePrompt(
            "Do you really want to delete this entry? The entry will be permanently deleted from the database.",
            "delete",
          );
          cy.wait(["@stratigraphyV2_DELETE", "@stratigraphyV2_by_borehole_GET", "@lithology_by_stratigraphyId_GET"]);
          cy.location().should(location => {
            expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy`);
          });
          cy.contains("No stratigraphies available...");
          cy.contains("button", "Create empty stratigraphy").should("be.visible").and("be.enabled");
          cy.contains("button", "Extract stratigraphy from profile").should("be.visible").and("be.enabled");
        });
      });
    });
  });

  it("can reset changes in stratigraphy form", () => {
    createBorehole("SILVERBIRD").as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
      cy.wait("@stratigraphyV2_by_borehole_GET");
      startBoreholeEditing();

      // Can reset new stratigraphy with changes
      getElementByDataCy("addemptystratigraphy-button").click();
      cy.location().should(location => {
        expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
      });
      verifyNoUnsavedChanges();
      setInput("name", "Reset Stratigraphy");
      discardChanges();
      cy.location().should(location => {
        expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy`);
      });

      // Can reset existing stratigraphy with changes
      getElementByDataCy("addemptystratigraphy-button").click();
      cy.location().should(location => {
        expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
      });
      setInput("name", "CHESSCLUSTER");
      saveForm();
      cy.wait(["@stratigraphyV2_POST", "@stratigraphyV2_by_borehole_GET"]);
      getElementByDataCy("stratigraphy-header").contains("CHESSCLUSTER").should("exist");
      verifyNoUnsavedChanges();
      setInput("name", "DISHMUTANT");
      verifyUnsavedChanges();
      discardChanges();
      evaluateInput("name", "CHESSCLUSTER");
      getElementByDataCy("stratigraphy-header").contains("CHESSCLUSTER").should("exist");
    });
  });

  it("navigates to primary stratigraphy if the id is invalid", () => {
    createBorehole({ originalName: "TRAILTOPPER" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphyV2(boreholeId, "TRAILTOPPER").as("stratigraphy_id");
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        const invalidStratigraphyId = stratigraphyId + 1111;
        goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy/${invalidStratigraphyId}?dev=true`);
        cy.wait("@stratigraphyV2_by_borehole_GET");
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/${stratigraphyId}`);
        });
      });
    });
  });

  it("shows chips for stratigraphy in view mode", () => {
    createBorehole({ originalName: "HEART" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      createStratigraphyV2(boreholeId, "JOLLYBOUNCE").as("stratigraphy_id");
      cy.get("@stratigraphy_id").then(stratigraphyId => {
        goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy/${stratigraphyId}?dev=true`);
        cy.wait("@stratigraphyV2_by_borehole_GET");

        // Does not show main stratigraphy chip if only one stratigraphy is available
        getElementByDataCy("stratigraphy-header").find(".MuiChip-root").should("have.length", 0);
        startBoreholeEditing();
        setInput("date", "2024-03-20");
        saveWithSaveBar();
        cy.wait(["@stratigraphyV2_PUT", "@stratigraphyV2_by_borehole_GET"]);
        stopBoreholeEditing();
        getElementByDataCy("stratigraphy-header")
          .find(".MuiChip-root")
          .should("have.length", 1)
          .and("contain", "20.03.2024");

        startBoreholeEditing();
        addStratigraphy();
        cy.location().should(location => {
          expect(location.pathname).to.eq(`/${boreholeId}/stratigraphy/new`);
        });
        setInput("name", "KARMAMAGIC");
        saveWithSaveBar();
        cy.wait(["@stratigraphyV2_POST", "@stratigraphyV2_by_borehole_GET"]);
        stopBoreholeEditing();
        getElementByDataCy("stratigraphy-content").find(".MuiChip-root").should("have.length", 0);
        navigateToTabWithTitle("JOLLYBOUNCE");
        getElementByDataCy("stratigraphy-content")
          .find(".MuiChip-root")
          .should("have.length", 2)
          .and("contain", "Main stratigraphy")
          .and("contain", "20.03.2024");
      });
    });
  });

  it("shows add buttons when no stratigraphies are available (legacy)", () => {
    goToRouteAndAcceptTerms(`/`);
    newUneditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.contains("No stratigraphies available...");
    startBoreholeEditing();
    cy.contains("button", "Create empty stratigraphy").should("be.visible").and("be.enabled");
    cy.contains("button", "Extract stratigraphy from profile").should("be.visible").and("be.disabled");
  });

  it("adds, updates, copies and deletes stratigraphies (legacy)", () => {
    function addTestStratigraphyValues() {
      setInput("name", "Test Stratigraphy");
      setInput("date", "2024-03-20");
      setSelect("qualityId", 4); // quality "good"
      getElementByDataCy("isprimary-switch").click();
    }
    function evaluateAddedStratigraphy() {
      evaluateInput("name", "Test Stratigraphy");
      evaluateSelect("qualityId", "good");
      evaluateInput("date", "2024-03-20");
      cy.get('[data-cy="isprimary-switch"] input').should("have.value", "true");
    }

    function waitForLayerWithDescriptions() {
      cy.wait(["@layer", "@facies_description", "@lithological_description"]);
    }

    function waitForStratigraphyContent() {
      cy.wait(["@get-layers-by-profileId", "@stratigraphy_by_borehole_GET"]);
      waitForLayerWithDescriptions();
    }

    // Navigate to borehole
    goToDetailRouteAndAcceptTerms("/1002057");
    startBoreholeEditing();
    navigateInSidebar(SidebarMenuItem.stratigraphy);

    // Add new stratigraphy
    addStratigraphy();
    cy.wait(["@stratigraphy_POST", "@stratigraphy_GET"]);
    waitForStratigraphyContent();

    // evaluate existing stratigraphy
    evaluateInput("name", "Leanna Aufderhar");
    evaluateSelect("qualityId", "not specified");
    evaluateInput("date", "2021-01-03");
    cy.get('[data-cy="isprimary-switch"] input').should("have.value", "true");

    cy.contains("Not specified").click(); // click on newly added stratigraphy
    cy.wait(["@stratigraphy_GET", "@stratigraphy_by_borehole_GET", "@get-layers-by-profileId"]);
    waitForLayerWithDescriptions();
    // Add input values
    addTestStratigraphyValues();

    //cancel editing
    getElementByDataCy("stratigraphy-cancel-button").click();

    evaluateInput("name", "");
    evaluateSelect("qualityId", "");
    evaluateInput("date", "");
    cy.get('[data-cy="isprimary-switch"] input').should("have.value", "false");

    // Readd input values and save
    addTestStratigraphyValues();
    getElementByDataCy("stratigraphy-save-button").should("not.be.disabled");
    getElementByDataCy("stratigraphy-save-button").click({ force: true });
    cy.wait("@stratigraphy_PUT");

    evaluateAddedStratigraphy();

    // evaluate existing stratigraphy is no longer primary
    cy.contains("Leanna Aufderhar").click();
    cy.get('[data-cy="isprimary-switch"] input').should("have.value", "false");

    cy.contains("Test Stratigraphy").click();
    evaluateInput("name", "Test Stratigraphy");

    // Check if form can be reset to already saved values
    setInput("name", "Test Stratigraphy - reupdated");
    setInput("date", "2022-02-22");
    setSelect("qualityId", 6);
    getElementByDataCy("stratigraphy-cancel-button").click();
    evaluateAddedStratigraphy();

    // Copy added stratigraphy
    getElementByDataCy("copy-button").click();
    cy.wait(["@stratigraphy_GET"]);
    waitForStratigraphyContent();

    cy.contains("Test Stratigraphy (Clone)").should("exist");
    cy.contains("Test Stratigraphy (Clone)").click();

    cy.wait(["@stratigraphy_GET"]);
    waitForStratigraphyContent();
    waitForLayerWithDescriptions();

    evaluateInput("name", "Test Stratigraphy (Clone)");
    // Stratigraphy form will soon be redesigned
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    evaluateSelect("qualityId", "good");
    evaluateInput("date", "2024-03-20");
    getElementByDataCy("isprimary-switch").should("not.be.checked");

    // Delete two newly added stratigraphies
    getElementByDataCy("delete-button").click();
    handlePrompt(
      "Do you really want to delete this entry? The entry will be permanently deleted from the database.",
      "cancel",
    );
    evaluateInput("name", "Test Stratigraphy (Clone)");
    // Stratigraphy form will soon be redesigned
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(500);
    evaluateSelect("qualityId", "good");
    evaluateInput("date", "2024-03-20");
    getElementByDataCy("isprimary-switch").should("not.be.checked");

    getElementByDataCy("delete-button").click();
    handlePrompt(
      "Do you really want to delete this entry? The entry will be permanently deleted from the database.",
      "delete",
    );

    cy.wait("@stratigraphy_DELETE");
    cy.contains("Test Stratigraphy (Clone)").should("not.exist");

    cy.contains("Test Stratigraphy").click();
    evaluateInput("name", "Test Stratigraphy");
    getElementByDataCy("delete-button").click();
    handlePrompt(
      "Do you really want to delete this entry? The entry will be permanently deleted from the database.",
      "delete",
    );
    cy.wait("@stratigraphy_DELETE");
    cy.contains("Test Stratigraphy").should("not.exist");
    stopBoreholeEditing();
  });
});
