import { WorkflowStatus } from "@swissgeol/ui-core";
import { colorStatusMap } from "../../../src/pages/detail/form/workflow/statusColorMap.ts";
import { capitalizeFirstLetter } from "../../../src/utils.js";
import { addItem, saveForm, saveWithSaveBar } from "../helpers/buttonHelpers.js";
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
  dropGeometryCSVFile,
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  selectInputFile,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  function navigateToWorkflowAndStartEditing(id) {
    goToDetailRouteAndAcceptTerms(`/${id}/status`);
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

  function finishReview() {
    clickSgcButtonWithContent("Review abschliessen");
    cy.get("sgc-modal-wrapper").find("sgc-button").contains("Review abschliessen").click();
    AssertHeaderChips(WorkflowStatus.Reviewed, "free");
    cy.wait(["@workflow_by_id", "@borehole_by_id"]);
    assertWorkflowSteps("Reviewed");
  }

  it("Can request review from users with controller privilege", () => {
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

      // check then uncheck all checkboxes
      clickCheckAllCheckbox("review");
      isCheckedTabStatusBox("review", "Borehole");
      isCheckedTabStatusBox("review", "Stratigraphy");
      isCheckedTabStatusBox("review", "Completion");
      isCheckedTabStatusBox("review", "Hydrogeology");
      isCheckedTabStatusBox("review", "Attachments");

      clickCheckAllCheckbox("review");
      isUncheckedTabStatusBox("review", "Borehole");
      isUncheckedTabStatusBox("review", "Stratigraphy");
      isUncheckedTabStatusBox("review", "Completion");
      isUncheckedTabStatusBox("review", "Hydrogeology");
      isUncheckedTabStatusBox("review", "Attachments");

      // click one completion child
      clickTabStatusCheckbox("review", "Instrumentation");

      isCheckedTabStatusBox("review", "Instrumentation");
      isIndeterminateTabStatusBox("review", "Completion");

      // click all remaining completion children
      clickTabStatusCheckbox("review", "Casing");
      clickTabStatusCheckbox("review", "Sealing/Backfilling");

      isCheckedTabStatusBox("review", "Casing");
      isCheckedTabStatusBox("review", "Sealing/Backfilling");
      isCheckedTabStatusBox("review", "Instrumentation");
      isCheckedTabStatusBox("review", "Completion");

      // navigate away and return to assert state has been saved
      navigateInSidebar(SidebarMenuItem.borehole);
      //Todo: update navigateInSidebar for new workflow tab
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
      isIndeterminateTabStatusBox("review", "Completion");
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

      finishReview();

      cy.get("sgc-tab").contains("Freigabe").click();

      // Check one child checkbox (Location) and one parent checkbox (Completion)
      clickTabStatusCheckbox("approval", "Location");
      clickTabStatusCheckbox("approval", "Completion");

      isIndeterminateTabStatusBox("approval", "Borehole");
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

      finishReview();

      clickSgcButtonWithContent("Publish");
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Publish").click();
      AssertHeaderChips(WorkflowStatus.Published);
      getElementByDataCy("workflow-additional-reviewed-chip").should("be.visible");

      clickSgcButtonWithContent("Status manuell ändern");
      cy.get(".select-trigger").eq(0).click();
      cy.get(".select-option").contains(WorkflowStatus.Draft).click();
      cy.get(".select-trigger").eq(1).click();
      // all users with editor privileges should be selectable
      cy.get(".select-option").should("have.length", 7);
      cy.get(".select-option").contains("viewer user").should("not.exist");
      cy.get(".select-option").contains("editor user").should("exist");
      cy.get(".select-option").contains("Admin User").click();
      cy.get("sgc-modal-wrapper").find("sgc-button").contains("Status manuell ändern").click();
      cy.wait(["@workflow_by_id", "@borehole_by_id"]);

      AssertHeaderChips(WorkflowStatus.Draft, "Admin User");
      getElementByDataCy("review-button").should("exist");
    });
  });

  function assertAllMenuItemsHaveReviewStatus(status) {
    getElementByDataCy("location-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("borehole-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("stratigraphy-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("completion-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("hydrogeology-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("wateringress-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("hydrotest-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", status);
    getElementByDataCy("attachments-menu-item").should("have.attr", "reviewed", status);
  }

  it("Displays checkmarks on side menu", () => {
    createBorehole({
      originalName: "Mouse mermaid",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();
      getElementByDataCy("hydrogeology-menu-item").click();

      assertAllMenuItemsHaveReviewStatus("false");

      clickCheckAllCheckbox("review");

      assertAllMenuItemsHaveReviewStatus("true");

      // assert that all menu items have partial checkmarks (where applicable)
      clickTabStatusCheckbox("review", "General");
      clickTabStatusCheckbox("review", "Lithology");
      clickTabStatusCheckbox("review", "Casing");
      clickTabStatusCheckbox("review", "Water ingress");
      clickTabStatusCheckbox("review", "Profiles");

      getElementByDataCy("location-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("borehole-menu-item").should("have.attr", "reviewed", "partial");
      getElementByDataCy("stratigraphy-menu-item").should("have.attr", "reviewed", "partial");
      getElementByDataCy("completion-menu-item").should("have.attr", "reviewed", "partial");
      getElementByDataCy("hydrogeology-menu-item").should("have.attr", "reviewed", "partial");
      getElementByDataCy("wateringress-menu-item").should("have.attr", "reviewed", "false");
      getElementByDataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("hydrotest-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("attachments-menu-item").should("have.attr", "reviewed", "partial");
    });
  });

  it("Resets reviewed and published checkboxes when borehole tabs change", () => {
    createBorehole({
      originalName: "Creamy window squash",
    }).as("borehole_id");
    cy.get("@borehole_id").then(id => {
      navigateToWorkflowAndStartEditing(id);
      requestReviewFromValidator();
      cy.get("sgc-tab").contains("Review").click();
      clickCheckAllCheckbox("review");
      finishReview();
      cy.get("sgc-tab").contains("Freigabe").click();
      clickCheckAllCheckbox("approval");
      getElementByDataCy("hydrogeology-menu-item").click(); // open hydrogeology menu items
      assertAllMenuItemsHaveReviewStatus("true");

      // edit borehole on location and borehole tab
      navigateInSidebar(SidebarMenuItem.location);
      setSelect("locationPrecisionId", 2);
      saveWithSaveBar();

      navigateInSidebar(SidebarMenuItem.borehole);
      setSelect("purposeId", 1);
      saveWithSaveBar();

      // navigateInSidebar(SidebarMenuItem.status); TODO: use this method when workflow V1 is removed and navigatgeInSidebar is updated
      getElementByDataCy("status-menu-item").click();
      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Location");
      isUncheckedTabStatusBox("review", "General");
      isIndeterminateTabStatusBox("review", "Borehole");

      cy.get("sgc-tab").contains("Freigabe").click();
      isUncheckedTabStatusBox("approval", "Location");
      isUncheckedTabStatusBox("approval", "General");
      isIndeterminateTabStatusBox("approval", "Borehole");

      getElementByDataCy("location-menu-item").should("have.attr", "reviewed", "false");
      getElementByDataCy("borehole-menu-item").should("have.attr", "reviewed", "partial");

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

      getElementByDataCy("borehole-menu-item").should("have.attr", "reviewed", "false");

      // navigateInSidebar(SidebarMenuItem.status); TODO: use this method when workflow V1 is removed and navigatgeInSidebar is updated
      getElementByDataCy("status-menu-item").click();

      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Sections");
      isUncheckedTabStatusBox("review", "Geometry");
      isUncheckedTabStatusBox("review", "Borehole");

      cy.get("sgc-tab").contains("Freigabe").click();
      isUncheckedTabStatusBox("approval", "Sections");
      isUncheckedTabStatusBox("approval", "Geometry");
      isUncheckedTabStatusBox("approval", "Borehole");

      navigateInSidebar(SidebarMenuItem.stratigraphy);

      // add new empty stratigraphy
      addItem("addEmptyStratigraphy");
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

      getElementByDataCy("stratigraphy-menu-item").should("have.attr", "reviewed", "false");
      getElementByDataCy("completion-menu-item").should("have.attr", "reviewed", "false");

      // navigateInSidebar(SidebarMenuItem.status); TODO: use this method when workflow V1 is removed and navigatgeInSidebar is updated
      getElementByDataCy("status-menu-item").click();

      cy.get("sgc-tab").contains("Review").click();
      isUncheckedTabStatusBox("review", "Stratigraphy");
      isUncheckedTabStatusBox("review", "Lithology");
      isUncheckedTabStatusBox("review", "Chronostratigraphy");
      isUncheckedTabStatusBox("review", "Lithostratigraphy");
      isUncheckedTabStatusBox("review", "Completion");
      isUncheckedTabStatusBox("review", "Casing");
      isUncheckedTabStatusBox("review", "Instrumentation");
      isUncheckedTabStatusBox("review", "Sealing/Backfilling");

      cy.get("sgc-tab").contains("Freigabe").click();
      isUncheckedTabStatusBox("approval", "Stratigraphy");
      isUncheckedTabStatusBox("approval", "Lithology");
      isUncheckedTabStatusBox("approval", "Chronostratigraphy");
      isUncheckedTabStatusBox("approval", "Lithostratigraphy");
      isUncheckedTabStatusBox("approval", "Completion");
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
      getElementByDataCy("addProfile-button").should("be.visible").click();
      cy.wait(["@upload-files", "@getAllAttachments"]);

      getElementByDataCy("hydrogeology-menu-item").click(); // open hydrogeology menu items
      getElementByDataCy("hydrogeology-menu-item").should("have.attr", "reviewed", "partial");
      getElementByDataCy("wateringress-menu-item").should("have.attr", "reviewed", "false");
      getElementByDataCy("groundwaterlevelmeasurement-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("hydrotest-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("fieldmeasurement-menu-item").should("have.attr", "reviewed", "true");
      getElementByDataCy("attachments-menu-item").should("have.attr", "reviewed", "partial");

      // navigateInSidebar(SidebarMenuItem.status); TODO: use this method when workflow V1 is removed and navigatgeInSidebar is updated
      getElementByDataCy("status-menu-item").click();

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

      cy.get("sgc-tab").contains("Freigabe").click();
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
});
