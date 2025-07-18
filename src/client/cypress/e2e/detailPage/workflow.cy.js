import { WorkflowStatus } from "@swissgeol/ui-core";
import { colorStatusMap } from "../../../src/pages/detail/form/workflow/statusColorMap.ts";
import { capitalizeFirstLetter } from "../../../src/utils.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  assertEmptyRequestReviewModal,
  assertWorkflowSteps,
  checkWorkflowChangeContent,
  clickSgcButtonWithContent,
  clickTabStatusCheckbox,
  evaluateComment,
  isCheckedTabStatusBox,
  isIntermediateTabStatusBox,
  isUncheckedTabStatusBox,
  waitForTabStatusUpdate,
} from "../helpers/swissgeolCoreHelpers.js";
import {
  createBorehole,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  it("Displays DEV workflow when feature flag is set", () => {
    goToDetailRouteAndAcceptTerms(`/1000036/status`);
    // displays legacy workflow form by default
    cy.contains("h4", "Publication workflow").should("exist");
    goToDetailRouteAndAcceptTerms(`/1000036/status?dev=true`);
    cy.contains("h4", "Publication workflow").should("not.exist");

    cy.get("sgc-translate").contains("Status").should("exist");
    cy.get("sgc-translate").contains("Draft").should("exist");
    cy.get("sgc-translate").contains("Zugewiesene Person").should("exist");
    cy.get(".assignee").contains("validator user").should("exist");

    checkWorkflowChangeContent("editor user", "Status von Published zu Reviewed geändert", "Omnis ut in.");
    checkWorkflowChangeContent(
      "controller user",
      "Borehole editor user zugewiesen",
      "Rerum repudiandae nihil accusamus sed omnis tempore laboriosam eaque est.",
    ); // Translation not yet available in core UI
  });

  function navigateToWorkflowAndStartEditing(id) {
    goToDetailRouteAndAcceptTerms(`/${id}/status?dev=true`);
    cy.wait("@borehole_by_id");
    startBoreholeEditing();
    getElementByDataCy("workflow-status-chip").should("contain", "Draft");
    assertWorkflowSteps("Draft");
  }

  function requestReviewFromValidator() {
    clickSgcButtonWithContent("Review anfordern");
    cy.get(".select-trigger").click();
    assertEmptyRequestReviewModal();
    cy.get(".select-option").contains("validator user").click();
    cy.get("sgc-modal-wrapper").find("sgc-button").contains("Review anfordern").click();
    cy.wait(["@workflow_by_id", "@borehole_by_id"]);
    assertWorkflowSteps("Review");
  }

  it("Can request review  from users with controller privilege", () => {
    createBorehole({
      originalName: "Flinchy clown fish",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);

      clickSgcButtonWithContent("Review anfordern");
      assertEmptyRequestReviewModal();

      // button in modal to request review should be disabled
      cy.get("sgc-button[disabled]").contains("Review anfordern");

      cy.get(".select-trigger").click();

      cy.get(".select-option").should("have.length", 6);
      // 2 users without controller privileges should not exist
      cy.get(".select-option").contains("viewer user").should("not.exist");
      cy.get(".select-option").contains("editor user").should("not.exist");

      // 6 users with controller privileges should be selectable
      cy.get(".select-option").contains("controller user").should("exist");
      cy.get(".select-option").contains("publisher user").should("exist");
      cy.get(".select-option").contains("user_that_can be_deleted").should("exist");
      cy.get(".select-option").contains("user_that_only has_files").should("exist");
      cy.get(".select-option").contains("validator user").should("exist");
      cy.get(".select-option").contains("Admin User").should("exist");

      cy.contains("Weiterleiten").click(); // click on dialog title to close dropdown again

      cy.get("sgc-text-area").find("textarea").type("I wanted to request a review, but then cancelled");
      clickSgcButtonWithContent("Abbrechen");
      // no comment should be added
      cy.get("sgc-workflow-change-template").find(".comment").should("not.exist");
      clickSgcButtonWithContent("Review anfordern");

      assertEmptyRequestReviewModal();

      cy.get(".select-trigger").click();
      cy.get(".select-option").contains("validator user").click();
      cy.get("sgc-text-area").find("textarea").type("I requested a review!");

      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Review anfordern").click();

      // assert new history entry
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").scrollIntoView();
      cy.get("sgc-workflow-change-template").find(".highlight").contains("Admin User").should("be.visible");

      cy.get("sgc-workflow-change-template")
        .find("li")
        .contains("Status von Draft zu Review geändert")
        .should("be.visible");

      evaluateComment("I requested a review!", true);

      // assert status update
      assertWorkflowSteps("Review");

      // assert new assigned user
      cy.get(".assignee").should("contain", "validator user");

      // assert status update in header
      getElementByDataCy("workflow-status-chip").should("contain", "Review");
      stopBoreholeEditing();
    });
  });

  it("Can update tab status on review tab", () => {
    createBorehole({
      originalName: "Zoo director",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();

      cy.get("sgc-tab").contains("Review").click();

      isUncheckedTabStatusBox("review", "Instrumentation");
      isUncheckedTabStatusBox("review", "Completion");

      // Click one completion child
      clickTabStatusCheckbox("review", "Instrumentation");

      isCheckedTabStatusBox("review", "Instrumentation");
      isIntermediateTabStatusBox("review", "Completion");

      // Click all remaining completion children
      clickTabStatusCheckbox("review", "Casing");
      clickTabStatusCheckbox("review", "Sealing/Backfilling");

      isCheckedTabStatusBox("review", "Casing");
      isCheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isCheckedTabStatusBox("review", "Completion");

      //navigate away and return to assert state has been saved
      navigateInSidebar(SidebarMenuItem.borehole);
      //Todo : update navigateInSidebar for new workflow tab
      getElementByDataCy(`status-menu-item`).click();
      cy.get("sgc-tab").contains("Review").click();

      isCheckedTabStatusBox("review", "Casing");
      isCheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isCheckedTabStatusBox("review", "Completion");

      //uncheck one checkbox
      clickTabStatusCheckbox("review", "Sealing/Backfilling");

      isCheckedTabStatusBox("review", "Casing");
      isUncheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isIntermediateTabStatusBox("review", "Completion");
    });
  });

  it("Can update tab status on publish tab and publish a borehole", () => {
    createBorehole({
      originalName: "Waterpark",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      assertWorkflowSteps("Draft");
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();

      // Check all checkboxes on review tab
      cy.get("#review").find("sgc-checkbox").first().click();
      waitForTabStatusUpdate();
      cy.get(`#review`).find("sgc-checkbox").should("have.class", "is-checked");

      // Finish review
      clickSgcButtonWithContent("Review abschliessen");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Review abschliessen").click();
      cy.wait(["@workflow_by_id", "@borehole_by_id"]);

      assertWorkflowSteps("Reviewed");

      cy.get("sgc-tab").contains("Freigabe").click();

      // Check one child checkbox (Location) and one parent checkbox (Completion)
      clickTabStatusCheckbox("approval", "Location");
      clickTabStatusCheckbox("approval", "Completion");

      isIntermediateTabStatusBox("approval", "Borehole");
      isCheckedTabStatusBox("approval", "Location");
      isUncheckedTabStatusBox("approval", "Section");
      isUncheckedTabStatusBox("approval", "Geometry");

      isCheckedTabStatusBox("approval", "Completion");
      isCheckedTabStatusBox("approval", "Instrumentation");
      isCheckedTabStatusBox("approval", "Casing");
      isCheckedTabStatusBox("approval", "Sealing/Backfilling");

      clickSgcButtonWithContent("Publish");
      // Add a comment
      cy.get("sgc-text-area").find("textarea").type("I published a borehole!");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Publish").click();
      assertWorkflowSteps("Reviewed");
      getElementByDataCy("workflow-status-chip").should("contain", "Published");
      cy.get("sgc-workflow-step").contains("Published").should("exist");

      cy.get("sgc-tab").contains("Verlauf").click();
      checkWorkflowChangeContent("Admin User", "Status von Reviewed zu Published geändert", "I published a borehole!");
    });
  });

  function AssertHeaderChips(status, assignee, hasRequestedChanges = false) {
    // Special case where enum value does not match translation
    if (status === WorkflowStatus.InReview) {
      getElementByDataCy("workflow-status-chip").should("contain", "Review");
    } else {
      getElementByDataCy("workflow-status-chip").should("contain", status);
    }
    getElementByDataCy("workflow-status-chip").should(
      "have.class",
      `MuiChip-color${capitalizeFirstLetter(colorStatusMap[status])}`,
    );
    if (assignee != null) {
      getElementByDataCy("workflow-assignee-chip").should("contain", assignee);
    }
    if (hasRequestedChanges) {
      getElementByDataCy("workflow-changes-requested-chip").should("be.visible");
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
    ClickInteractionAndAssignNewUser("Neue Person zuweisen", newAssignee);
  }

  it("Displays correct badges in detail header", () => {
    createBorehole({
      originalName: "Waterslide",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      assertWorkflowSteps(WorkflowStatus.Draft);
      AssertHeaderChips(WorkflowStatus.Draft, "free");
      AssignNewUser("editor user");
      AssertHeaderChips(WorkflowStatus.Draft, "editor user");
      getElementByDataCy("review-button").should("not.exist");
      AssignNewUser("Admin User");
      AssertHeaderChips(WorkflowStatus.Draft, "Admin User");
      // Button to start review is only visible if current user is the assignee
      getElementByDataCy("review-button").should("exist");
      getElementByDataCy("review-button").click();
      AssertHeaderChips(WorkflowStatus.InReview, "Admin User");
      assertWorkflowSteps("Review");

      ClickInteractionAndAssignNewUser("Änderungen anfordern", "controller user");
      AssertHeaderChips(WorkflowStatus.Draft, "controller user", true);

      ClickInteractionAndAssignNewUser("Review anfordern", "publisher user");
      AssertHeaderChips(WorkflowStatus.InReview, "publisher user");

      clickSgcButtonWithContent("Review abschliessen");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Review abschliessen").click();
      AssertHeaderChips(WorkflowStatus.Reviewed, "free");
      assertWorkflowSteps("Reviewed");

      clickSgcButtonWithContent("Publish");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Publish").click();
      AssertHeaderChips(WorkflowStatus.Published);
      getElementByDataCy("workflow-additional-reviewed-chip").should("be.visible");

      clickSgcButtonWithContent("Status manuell ändern");
      cy.get(".select-trigger").eq(0).click();
      cy.get(".select-option").contains(WorkflowStatus.Draft).click();
      cy.get(".select-trigger").eq(1).click();
      cy.get(".select-option").contains("Admin User").click();
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Status manuell ändern").click();
      cy.wait(["@workflow_by_id", "@borehole_by_id"]);

      AssertHeaderChips(WorkflowStatus.Draft, "Admin User");
      getElementByDataCy("review-button").should("exist");
    });
  });
});
