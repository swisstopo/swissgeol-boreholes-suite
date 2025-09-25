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

  it.skip("starts stratigraphy extraction", () => {
    // Skip test as it is prone to timeouts on CI
    createBorehole({ originalName: "SCHOOLDIONYSUS" }).as("borehole_id");
    cy.get("@borehole_id").then(boreholeId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy?dev=true`);
      cy.wait("@stratigraphyV2_by_borehole_GET");
      startBoreholeEditing();
      getElementByDataCy("extractstratigraphyfromprofile-button").click();
      getElementByDataCy("addProfile-button").click();

      cy.get('input[type="file"]').attachFile("labeling_attachment.pdf");
      cy.wait("@extract-stratigraphy", { timeout: 60000 }).then(interception => {
        expect(interception.response.statusCode).to.eq(200);
        cy.contains("No valid stratigraphy could be extracted from the profile");
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
        getElementByDataCy("stratigraphy-header").should("not.exist");
        navigateToTabWithTitle("JOLLYBOUNCE");
        getElementByDataCy("stratigraphy-content")
          .find(".MuiChip-root")
          .should("have.length", 2)
          .and("contain", "Main stratigraphy")
          .and("contain", "20.03.2024");
      });
    });
  });
});
