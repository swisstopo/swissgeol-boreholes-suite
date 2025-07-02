export function assertWorkflowSteps(activeStep: string) {
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Draft");
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Review");
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Reviewed");
  cy.get("sgc-workflow-step.is-active").find("sgc-translate").should("contain", activeStep);
}

export function clickSgcButtonWithContent(content: string) {
  cy.get("sgc-button").find("sgc-translate").contains(content).click();
}

export function evaluateComment(content: string, exists: boolean) {
  const assertion = exists ? "be.visible" : "not.exist";
  cy.get("sgc-workflow-change-template").find(".comment").contains(content).should(assertion);
}

export function assertEmptyRequestReviewModal() {
  cy.get(".select-trigger span").should("be.empty"); // Assignee select should be empty
  cy.get("sgc-text-area").find("textarea").should("be.empty"); // Comment input should be empty
}
