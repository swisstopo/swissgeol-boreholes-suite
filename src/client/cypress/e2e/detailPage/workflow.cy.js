import { WorkflowStatus } from "@swissgeol/ui-core";
import { restrictionFreeCode } from "../../../src/components/codelist.ts";
import { colorStatusMap } from "../../../src/pages/detail/form/workflow/statusColorMap.ts";
import { capitalizeFirstLetter } from "../../../src/utils.js";
import { addItem, saveForm, saveWithSaveBar } from "../helpers/buttonHelpers.js";
import { checkRowWithIndex, verifyRowContains, verifyTableLength } from "../helpers/dataGridHelpers.js";
import { setInput, setSelect } from "../helpers/formHelpers.js";
import { BoreholeTab, navigateInBorehole, navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  assertEmptyRequestReviewModal,
  assertWorkflowSteps,
  checkWorkflowChangeContent,
  clickCheckAllCheckbox,
  clickSgcButtonWithContent,
  clickTabStatusCheckbox,
  evaluateComment,
  isCheckedTabStatusBox,
  isIndeterminateTabStatusBox,
  isUncheckedTabStatusBox,
  waitForTabStatusUpdate,
} from "../helpers/swissgeolCoreHelpers.js";
import {
  createBorehole,
  createBoreholeWithCompleteDataset,
  dropGeometryCSVFile,
  goToDetailRouteAndAcceptTerms,
  loginAsEditor,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

function manuallyResetStatusToDraft() {
  clickSgcButtonWithContent("Change status manually");
  cy.get(".select-trigger").eq(0).click();
  cy.get(".select-option").contains(WorkflowStatus.Draft).click();
  cy.get(".select-trigger").eq(1).click();
  // all users with editor privileges should be selectable
  cy.get(".select-option").should("have.length", 7);
  cy.get(".select-option").contains("viewer user").should("not.exist");
  cy.get(".select-option").contains("Editor User").should("exist");
  cy.get(".select-option").contains("Admin User").click();
  cy.get("sgc-modal-wrapper").find("sgc-button").contains("Change status manually").click();
  cy.wait(["@workflow_by_id", "@borehole_by_id"]);
}

describe("Tests the publication workflow.", () => {
  function navigateToWorkflowAndStartEditing(id) {
    goToDetailRouteAndAcceptTerms(`/${id}/status`);
    cy.wait("@borehole_by_id");
    startBoreholeEditing();
    cy.dataCy("workflow-status-chip").should("contain", "Draft");
    assertWorkflowSteps("Draft");
  }

  function requestReviewFromValidator() {
    clickSgcButtonWithContent("Request review");
    cy.get(".select-trigger").click();
    assertEmptyRequestReviewModal();
    cy.get(".select-option").contains("validator user").click();
    cy.get("sgc-modal-wrapper").find("sgc-button").contains("Request review").click();
    cy.wait(["@workflow_by_id", "@borehole_by_id"]);
    assertWorkflowSteps("In review");
  }

  function finishReview() {
    clickSgcButtonWithContent("Complete review");
    cy.get("sgc-modal-wrapper").find("sgc-button").contains("Complete review").click();
    AssertHeaderChips(WorkflowStatus.Reviewed);
    cy.wait(["@workflow_by_id", "@borehole_by_id"]);
    assertWorkflowSteps("Reviewed");
  }

  it("Can request review from users with controller privilege", () => {
    createBorehole({
      originalName: "Flinchy clown fish",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);

      clickSgcButtonWithContent("Request review");
      assertEmptyRequestReviewModal();

      // button in modal to request review should be disabled
      cy.get("sgc-button[disabled]").contains("Request review");

      cy.get(".select-trigger").click();

      cy.get(".select-option").should("have.length", 6);
      // 2 users without controller privileges should not exist
      cy.get(".select-option").contains("viewer user").should("not.exist");
      cy.get(".select-option").contains("Editor User").should("not.exist");

      // 6 users with controller privileges should be selectable
      cy.get(".select-option").contains("controller user").should("exist");
      cy.get(".select-option").contains("publisher user").should("exist");
      cy.get(".select-option").contains("user_that_can be_deleted").should("exist");
      cy.get(".select-option").contains("user_that_only has_files").should("exist");
      cy.get(".select-option").contains("validator user").should("exist");
      cy.get(".select-option").contains("Admin User").should("exist");

      cy.contains("Forward").click(); // click on dialog title to close dropdown again

      cy.get("sgc-text-area").find("textarea").type("I wanted to request a review, but then cancelled");
      clickSgcButtonWithContent("Cancel");
      // no comment should be added
      cy.get("sgc-workflow-change-template").find(".comment").should("not.exist");
      clickSgcButtonWithContent("Request review");

      assertEmptyRequestReviewModal();

      cy.get(".select-trigger").click();
      cy.get(".select-option").contains("validator user").click();
      cy.get("sgc-text-area").find("textarea").type("I requested a review!");

      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Request review").click();

      // assert new history entry
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").scrollIntoView();
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").should("be.visible");

      cy.get("sgc-workflow-change-template")
        .find("li")
        .contains("Status changed from Draft to In review")
        .should("be.visible");

      evaluateComment("I requested a review!", true);

      // assert status update
      assertWorkflowSteps("In review");

      // assert new assigned user
      cy.get(".assignee").should("contain", "validator user");

      // assert status update in header
      cy.dataCy("workflow-status-chip").should("contain", "Review");
      stopBoreholeEditing();
    });
  });

  it("Can update tab status on review tab", () => {
    createBoreholeWithCompleteDataset().as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();

      cy.get("sgc-tab").contains("Review").click();

      isUncheckedTabStatusBox("review", "Instrumentation");
      isUncheckedTabStatusBox("review", "Borehole architecture");

      // check then uncheck all checkboxes
      clickCheckAllCheckbox("review");
      isCheckedTabStatusBox("review", "Borehole");
      isCheckedTabStatusBox("review", "Stratigraphy");
      isCheckedTabStatusBox("review", "Borehole architecture");
      isCheckedTabStatusBox("review", "Hydrogeology");
      isCheckedTabStatusBox("review", "Attachments");

      clickCheckAllCheckbox("review");
      isUncheckedTabStatusBox("review", "Borehole");
      isUncheckedTabStatusBox("review", "Stratigraphy");
      isUncheckedTabStatusBox("review", "Borehole architecture");
      isUncheckedTabStatusBox("review", "Hydrogeology");
      isUncheckedTabStatusBox("review", "Attachments");

      // click one completion child
      clickTabStatusCheckbox("review", "Instrumentation");

      isCheckedTabStatusBox("review", "Instrumentation");
      isIndeterminateTabStatusBox("review", "Borehole architecture");

      // click all remaining completion children
      clickTabStatusCheckbox("review", "Casing");
      clickTabStatusCheckbox("review", "Sealing/Backfilling");

      isCheckedTabStatusBox("review", "Casing");
      isCheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isCheckedTabStatusBox("review", "Borehole architecture");

      // navigate away and return to assert state has been saved
      navigateInSidebar(SidebarMenuItem.borehole);
      navigateInSidebar(SidebarMenuItem.status);
      cy.get("sgc-tab").contains("Review").click();

      isCheckedTabStatusBox("review", "Casing");
      isCheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isCheckedTabStatusBox("review", "Borehole architecture");

      //uncheck one checkbox
      clickTabStatusCheckbox("review", "Sealing/Backfilling");

      isCheckedTabStatusBox("review", "Casing");
      isUncheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isIndeterminateTabStatusBox("review", "Borehole architecture");
    });
  });

  it("Cannot publish a borehole with nothing approved", () => {
    createBorehole({
      originalName: "Grocery Wagon",
      restrictionId: restrictionFreeCode,
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      finishReview();
      cy.get("sgc-button[disabled]").contains("Publish");
    });
  });

  it("Can update tab status on publish tab and publish a borehole", () => {
    createBoreholeWithCompleteDataset().as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      assertWorkflowSteps("Draft");
      AssertHeaderChips(WorkflowStatus.Draft, null, false, "Free");
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();

      // Check all checkboxes on review tab
      cy.get("#review").find("sgc-checkbox").first().click();
      waitForTabStatusUpdate();
      cy.get(`#review`).find("sgc-checkbox").should("have.class", "is-checked");

      finishReview();
      AssertHeaderChips(WorkflowStatus.Reviewed, null, false, "Free");

      cy.get("sgc-tab").contains("Approval").click();

      // Check one child checkbox (Location) and one parent checkbox (Borehole architecture)
      clickTabStatusCheckbox("approval", "Location");
      clickTabStatusCheckbox("approval", "Borehole architecture");

      isIndeterminateTabStatusBox("approval", "Borehole");
      isCheckedTabStatusBox("approval", "Location");
      isUncheckedTabStatusBox("approval", "Section");
      isUncheckedTabStatusBox("approval", "Borehole trajectory");

      isCheckedTabStatusBox("approval", "Borehole architecture");
      isCheckedTabStatusBox("approval", "Instrumentation");
      isCheckedTabStatusBox("approval", "Casing");
      isCheckedTabStatusBox("approval", "Sealing/Backfilling");

      clickSgcButtonWithContent("Publish");
      // Add a comment
      cy.get("sgc-text-area").find("textarea").type("I published a borehole!");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Publish").click();
      assertWorkflowSteps("Reviewed");
      cy.dataCy("workflow-status-chip").should("contain", "Published");
      cy.get("sgc-workflow-step").contains("Published").should("exist");
      // no restriction chip in published status
      cy.dataCy("restricted-chip").should("not.exist");

      cy.get("sgc-tab").contains("History").click();
      checkWorkflowChangeContent("Admin User", "Status changed from Reviewed to Published", "I published a borehole!");
    });
  });

  function AssertHeaderChips(status, assignee, hasRequestedChanges = false, restrictionStatus = null) {
    // Special case where enum value does not match translation
    if (status === WorkflowStatus.InReview) {
      cy.dataCy("workflow-status-chip").should("contain", "Review");
    } else {
      cy.dataCy("workflow-status-chip").should("contain", status);
    }
    cy.dataCy("workflow-status-chip").should(
      "have.class",
      `MuiChip-color${capitalizeFirstLetter(colorStatusMap[status])}`,
    );
    if (assignee != null) {
      cy.dataCy("workflow-assignee-chip").should("contain", assignee);
    }
    if (hasRequestedChanges) {
      cy.dataCy("workflow-changes-requested-chip").should("be.visible");
    }
    if (restrictionStatus != null) {
      cy.dataCy("restricted-chip").should("be.visible");
      cy.dataCy("restricted-chip").should("contain", restrictionStatus);
    }
  }

  function ClickInteractionAndAssignNewUser(buttonLabel, newAssignee) {
    clickSgcButtonWithContent(buttonLabel);
    cy.get(".select-trigger").click();
    cy.get(".select-option").contains(newAssignee).click();
    cy.get("sgc-modal-wrapper").find("sgc-button").contains(buttonLabel).click();
    cy.wait(["@workflow_by_id", "@borehole_by_id"]);
  }

  function AssignNewUser(newAssignee) {
    ClickInteractionAndAssignNewUser("Assign new person", newAssignee);
  }

  it("Displays correct badges in detail header", () => {
    createBorehole({
      originalName: "Waterslide",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      assertWorkflowSteps(WorkflowStatus.Draft);
      AssertHeaderChips(WorkflowStatus.Draft);
      AssignNewUser("Editor User");
      AssertHeaderChips(WorkflowStatus.Draft, "Editor User");
      cy.dataCy("review-button").should("not.exist");
      AssignNewUser("Admin User");
      AssertHeaderChips(WorkflowStatus.Draft, "Admin User");
      // Button to start review is only visible if current user is the assignee
      cy.dataCy("review-button").should("exist");
      cy.dataCy("review-button").click();
      AssertHeaderChips(WorkflowStatus.InReview, "Admin User");
      assertWorkflowSteps("In review");

      ClickInteractionAndAssignNewUser("Request changes", "controller user");
      AssertHeaderChips(WorkflowStatus.Draft, "controller user", true);

      ClickInteractionAndAssignNewUser("Request review", "publisher user");
      AssertHeaderChips(WorkflowStatus.InReview, "publisher user");

      finishReview();

      clickSgcButtonWithContent("Publish");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Publish").click();
      AssertHeaderChips(WorkflowStatus.Published);
      cy.dataCy("workflow-additional-reviewed-chip").should("be.visible");
      manuallyResetStatusToDraft();

      AssertHeaderChips(WorkflowStatus.Draft, "Admin User");
      cy.dataCy("review-button").should("exist");
    });
  });

  function assertAllMenuItemsHaveReviewStatus(status) {
    cy.dataCy("location-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("borehole-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("stratigraphy-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("completion-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("hydrogeology-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("wateringress-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("hydrotest-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", status);
    cy.dataCy("attachments-menu-item").should("have.attr", "reviewed", status);
  }

  it("Displays checkmarks on side menu", () => {
    createBoreholeWithCompleteDataset().as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();
      cy.dataCy("hydrogeology-menu-item").click();

      assertAllMenuItemsHaveReviewStatus("false");

      clickCheckAllCheckbox("review");

      assertAllMenuItemsHaveReviewStatus("true");

      // assert that all menu items have partial checkmarks (where applicable)
      clickTabStatusCheckbox("review", "General");
      clickTabStatusCheckbox("review", "Lithology");
      clickTabStatusCheckbox("review", "Casing");
      clickTabStatusCheckbox("review", "Water ingress");
      clickTabStatusCheckbox("review", "Profiles");

      cy.dataCy("location-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("borehole-menu-item").should("have.attr", "reviewed", "partial");
      cy.dataCy("stratigraphy-menu-item").should("have.attr", "reviewed", "partial");
      cy.dataCy("completion-menu-item").should("have.attr", "reviewed", "partial");
      cy.dataCy("hydrogeology-menu-item").should("have.attr", "reviewed", "partial");
      cy.dataCy("wateringress-menu-item").should("have.attr", "reviewed", "false");
      cy.dataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("hydrotest-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("attachments-menu-item").should("have.attr", "reviewed", "partial");
    });
  });

  // TODO: Re-add and fix navigation to location tab https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2390
  it.skip("Resets reviewed and published checkboxes when borehole tabs change", () => {
    createBoreholeWithCompleteDataset().as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();
      clickCheckAllCheckbox("review");
      finishReview();
      cy.get("sgc-tab").contains("Approval").click();
      clickCheckAllCheckbox("approval");
      cy.dataCy("hydrogeology-menu-item").click(); // open hydrogeology menu items
      assertAllMenuItemsHaveReviewStatus("true");

      manuallyResetStatusToDraft();

      // edit borehole on location and borehole tab
      navigateInSidebar(SidebarMenuItem.location);
      startBoreholeEditing();
      setSelect("locationPrecisionId", 2);
      saveWithSaveBar();

      navigateInSidebar(SidebarMenuItem.borehole);
      setSelect("purposeId", 1);
      saveWithSaveBar();

      navigateInSidebar(SidebarMenuItem.status);
      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Location");
      isUncheckedTabStatusBox("review", "General");
      isIndeterminateTabStatusBox("review", "Borehole");

      cy.get("sgc-tab").contains("Approval").click();
      isUncheckedTabStatusBox("approval", "Location");
      isUncheckedTabStatusBox("approval", "General");
      isIndeterminateTabStatusBox("approval", "Borehole");

      cy.dataCy("location-menu-item").should("have.attr", "reviewed", "false");
      cy.dataCy("borehole-menu-item").should("have.attr", "reviewed", "partial");

      navigateInSidebar(SidebarMenuItem.borehole);
      navigateInBorehole(BoreholeTab.sections);

      // add section and save
      addItem("addSection");
      setInput("name", "AA_CAPYBARA");
      setInput("sectionElements.0.fromDepth", "0");
      setInput("sectionElements.0.toDepth", "1");
      saveForm();
      cy.wait(["@section_POST", "@section_GET"]);

      navigateInBorehole(BoreholeTab.geometry);
      cy.wait("@boreholegeometry_formats");

      // add geometry file and save
      dropGeometryCSVFile();
      cy.get('[data-cy="boreholegeometryimport-button"]').should("be.enabled");
      setSelect("geometryFormat", 1);
      cy.get('[data-cy="boreholegeometryimport-button"]').click();

      cy.dataCy("borehole-menu-item").should("have.attr", "reviewed", "false");

      navigateInSidebar(SidebarMenuItem.status);

      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Sections");
      isUncheckedTabStatusBox("review", "Borehole trajectory");
      isUncheckedTabStatusBox("review", "Borehole");

      cy.get("sgc-tab").contains("Approval").click();
      isUncheckedTabStatusBox("approval", "Sections");
      isUncheckedTabStatusBox("approval", "Borehole trajectory");
      isUncheckedTabStatusBox("approval", "Borehole");

      navigateInSidebar(SidebarMenuItem.stratigraphy);

      // add new empty stratigraphy
      cy.dataCy("addStratigraphy-button-select").click();
      cy.dataCy("addEmpty-button-select-item").click();
      cy.wait([
        "@stratigraphy_POST",
        "@stratigraphy_by_borehole_GET",
        "@stratigraphy_by_borehole_GET",
        "@stratigraphy_GET",
        "@get-layers-by-profileId",
        "@lithological_description",
        "@facies_description",
        "@layer",
      ]);

      // add new empty completion
      navigateInSidebar(SidebarMenuItem.completion);
      addItem("addCompletion");
      setInput("name", "Freaky Fennel");
      setSelect("kindId", 1);
      saveForm("completion-header");

      cy.dataCy("stratigraphy-menu-item").should("have.attr", "reviewed", "false");
      cy.dataCy("completion-menu-item").should("have.attr", "reviewed", "false");

      navigateInSidebar(SidebarMenuItem.status);

      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Stratigraphy");
      isUncheckedTabStatusBox("review", "Lithology");
      isUncheckedTabStatusBox("review", "Chronostratigraphy");
      isUncheckedTabStatusBox("review", "Lithostratigraphy");
      isUncheckedTabStatusBox("review", "Borehole architecture");
      isUncheckedTabStatusBox("review", "Casing");
      isUncheckedTabStatusBox("review", "Instrumentation");
      isUncheckedTabStatusBox("review", "Sealing/Backfilling");

      cy.get("sgc-tab").contains("Approval").click();
      isUncheckedTabStatusBox("approval", "Stratigraphy");
      isUncheckedTabStatusBox("approval", "Lithology");
      isUncheckedTabStatusBox("approval", "Chronostratigraphy");
      isUncheckedTabStatusBox("approval", "Lithostratigraphy");
      isUncheckedTabStatusBox("approval", "Borehole architecture");
      isUncheckedTabStatusBox("approval", "Casing");
      isUncheckedTabStatusBox("approval", "Instrumentation");
      isUncheckedTabStatusBox("approval", "Sealing/Backfilling");

      // create wateringress
      navigateInSidebar(SidebarMenuItem.hydrogeology);
      navigateInSidebar(SidebarMenuItem.waterIngress);
      addItem("addWaterIngress");
      setSelect("quantityId", 2);
      saveForm();
      cy.wait("@wateringress_GET");

      // upload profile attachment
      navigateInSidebar(SidebarMenuItem.attachments);
      selectInputFile("QUIETBULLDOZER.txt", "text/plain");
      cy.dataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      cy.dataCy("hydrogeology-menu-item").click(); // open hydrogeology menu items
      cy.dataCy("hydrogeology-menu-item").should("have.attr", "reviewed", "partial");
      cy.dataCy("wateringress-menu-item").should("have.attr", "reviewed", "false");
      cy.dataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("hydrotest-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", "true");
      cy.dataCy("attachments-menu-item").should("have.attr", "reviewed", "partial");

      navigateInSidebar(SidebarMenuItem.status);

      cy.get("sgc-tab").contains("Review").click();
      isIndeterminateTabStatusBox("review", "Hydrogeology");
      isUncheckedTabStatusBox("review", "Water ingress");
      isCheckedTabStatusBox("review", "Groundwater measurement");
      isCheckedTabStatusBox("review", "Hydrotest");
      isCheckedTabStatusBox("review", "Field measurement");
      isIndeterminateTabStatusBox("review", "Attachments");
      isUncheckedTabStatusBox("review", "Profiles");
      isCheckedTabStatusBox("review", "Photos");
      isCheckedTabStatusBox("review", "Documents");

      cy.get("sgc-tab").contains("Approval").click();
      isIndeterminateTabStatusBox("approval", "Hydrogeology");
      isUncheckedTabStatusBox("approval", "Water ingress");
      isCheckedTabStatusBox("approval", "Groundwater measurement");
      isCheckedTabStatusBox("approval", "Hydrotest");
      isCheckedTabStatusBox("approval", "Field measurement");
      isIndeterminateTabStatusBox("approval", "Attachments");
      isUncheckedTabStatusBox("approval", "Profiles");
      isCheckedTabStatusBox("approval", "Photos");
      isCheckedTabStatusBox("approval", "Documents");
    });
  });

  it("Editor can request review and is redirected", () => {
    createBorehole({
      originalName: "Cormoran Cellar",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      // For some reason, the editor session cannot be reused here, so we clear all sessions ¯\_(ツ)_/¯
      Cypress.session.clearAllSavedSessions();
      loginAsEditor();
      navigateToWorkflowAndStartEditing(id);
      clickSgcButtonWithContent("Request review");
      cy.get(".select-trigger").click();
      assertEmptyRequestReviewModal();
      cy.get(".select-option").contains("validator user").click();
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Request review").click();
      cy.get(".MuiAlert-message").contains(
        "The status of the borehole was changed. You no longer have permission to edit the borehole.",
      );
      cy.location().should(location => {
        expect(location.pathname).to.eq(`/${id}/location`);
      });
    });
  });

  it("Can review and reset log tab", () => {
    createBoreholeWithCompleteDataset().as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "LOG");
      isUncheckedTabStatusBox("review", "Log runs");
      clickTabStatusCheckbox("review", "Log runs");
      isCheckedTabStatusBox("review", "LOG");
      isCheckedTabStatusBox("review", "Log runs");
      navigateInSidebar(SidebarMenuItem.log);
      verifyTableLength(1);
      verifyRowContains("Run 111", 0); // log run from complete borehole
      checkRowWithIndex(0);
      cy.dataCy("delete-button").click();
      verifyTableLength(0);
      saveWithSaveBar();
      navigateInSidebar(SidebarMenuItem.status);
      cy.get("sgc-tab").contains("Review").click();

      // log was reset to unchecked
      isUncheckedTabStatusBox("review", "LOG");
      isUncheckedTabStatusBox("review", "Log runs");
    });
  });
});
