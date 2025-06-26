import { evaluateSelect, setInput, setSelect } from "../helpers/formHelpers.js";
import {
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers.js";

describe("Tests the publication workflow.", () => {
  const getShadowElementFromTree = (hostElement, selectorMapping) => {
    // eslint-disable-next-line cypress/no-assigning-return-values
    let chain = cy.get(hostElement);

    selectorMapping.forEach(({ selector, useShadow = true }) => {
      if (useShadow) {
        chain = chain.shadow().find(selector);
      } else {
        chain = chain.find(selector);
      }
    });

    return chain;
  };

  const checkWorkflowChangeContent = (index, user, date, statusChange, comment) => {
    getShadowElementFromTree("sgc-workflow", [
      { selector: "sgc-tabs", useShadow: true },
      { selector: 'div[slot="panels"] > sgc-workflow-history', useShadow: false },
      { selector: "sgc-workflow-change", useShadow: true },
    ])
      .eq(index)
      .shadow()
      .within(() => {
        cy.get("sgc-workflow-change-template")
          .shadow()
          .within(() => {
            cy.get(".heading .highlight").should("contain", user);
          });

        cy.get("sgc-workflow-change-template li[slot='mutations']").should("contain", statusChange);
        cy.get("sgc-workflow-change-template div[slot='body']").should("contain", comment);
      });
  };

  it("Displays DEV workflow when feature flag is set", () => {
    goToDetailRouteAndAcceptTerms(`/1000036/status`);
    // displays legacy workflow form by default
    cy.contains("h4", "Publication workflow").should("exist");
    goToDetailRouteAndAcceptTerms(`/1000036/status?dev=true`);
    cy.contains("h4", "Publication workflow").should("not.exist");

    getShadowElementFromTree("sgc-workflow", [{ selector: "sgc-workflow-steps" }, { selector: "sgc-translate" }])
      .contains("Status")
      .should("exist");

    getShadowElementFromTree("sgc-workflow", [
      { selector: "sgc-workflow-steps" },
      { selector: "sgc-workflow-step" },
      { selector: "sgc-translate" },
    ])
      .contains("Draft")
      .should("exist");

    getShadowElementFromTree("sgc-workflow", [{ selector: "sgc-workflow-assignee" }, { selector: "sgc-translate" }])
      .contains("Zugewiesene Person")
      .should("exist"); // Translation not yet available in core UI

    getShadowElementFromTree("sgc-workflow", [{ selector: "sgc-workflow-assignee" }, { selector: ".assignee" }])
      .contains("validator user")
      .should("exist");

    checkWorkflowChangeContent(
      1,
      "editor user",
      "16. Nov. 2021",
      "Status von Published zu Reviewed geändert",
      "Omnis ut in.",
    );
    checkWorkflowChangeContent(
      2,
      "controller user",
      "16. Nov. 2021",
      "Asset editor user zugewiesen",
      "Rerum repudiandae nihil accusamus sed omnis tempore laboriosam eaque est.",
    ); // Translation not yet available in core UI, wrong "asset" hardcoded in component
  });

  it.skip("Can request review from users with controller privilege", () => {
    goToDetailRouteAndAcceptTerms(`/1000011/status?dev=true`);
    startBoreholeEditing();
    getElementByDataCy("workflow-status-chip").should("contain", "Draft");
    // assert that the draft step is active
    getElementByDataCy("workflow-status-Draft-active").should("exist");
    getElementByDataCy("workflow-status-InReview-inactive").should("exist");
    getElementByDataCy("workflow-status-Reviewed-inactive").should("exist");
    getElementByDataCy("request-review-button").click();
    evaluateSelect("newAssigneeId", "");
    cy.get('textarea[name="comment"]').should("be.empty");
    getElementByDataCy("request-review-dialog-button").should("be.disabled");
    getElementByDataCy("newAssigneeId-formSelect").click();
    // 5 users with controller privileges should be selectable
    cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option").should("have.length", 6);
    cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option").contains("Viewer User").should("not.exist");
    cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option").contains("Editor User").should("not.exist");
    cy.get(".MuiAutocomplete-popper .MuiAutocomplete-option").contains("Controller User").should("exist");
    cy.get("body").click(0, 0); // click on dialog title to close dropdown again
    setInput("comment", "I wanted to request a review, but then cancelled");
    getElementByDataCy("cancel-button").click();

    cy.get('[data-cy^="workflow-history-entry-"]')
      .contains("I wanted to request a review, but then cancelled")
      .should("not.exist");

    getElementByDataCy("request-review-button").click();
    evaluateSelect("newAssigneeId", "");
    cy.get('textarea[name="comment"]').should("be.empty");
    setSelect("newAssigneeId", 5); // Validator User
    setInput("comment", "I requested a review!");
    getElementByDataCy("request-review-dialog-button").should("not.be.disabled");
    getElementByDataCy("request-review-dialog-button").click();

    // assert new history entry
    cy.get('[data-cy^="workflow-history-entry-"]').contains("Admin User").should("be.visible");
    cy.get('[data-cy^="workflow-history-entry-"]').contains("Changed status from Draft to Review").should("be.visible");
    cy.get('[data-cy^="workflow-history-entry-"]').contains("I requested a review!").should("be.visible");

    // assert status update
    getElementByDataCy("workflow-status-Draft-inactive").should("exist");
    getElementByDataCy("workflow-status-InReview-active").should("exist");
    getElementByDataCy("workflow-status-Reviewed-inactive").should("exist");

    // assert new assigned user
    getElementByDataCy("assigned-user-name").should("contain", "Validator User");

    // assert status update in header
    getElementByDataCy("workflow-status-chip").should("contain", "Review");
    stopBoreholeEditing();
  });
});
