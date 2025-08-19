export function assertWorkflowSteps(activeStep: string) {
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Draft");
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Review");
  cy.get("sgc-workflow-step").find("sgc-translate").should("contain", "Reviewed");
  cy.get("sgc-workflow-step.is-active").find("sgc-translate").should("contain", activeStep);
}

export function clickSgcButtonWithContent(content: string) {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  cy.get("sgc-button").contains(content).click();
}

export function evaluateComment(content: string, exists: boolean) {
  const assertion = exists ? "be.visible" : "not.exist";
  cy.get("sgc-workflow-change-template").find(".comment").contains(content).should(assertion);
}

export function assertEmptyRequestReviewModal() {
  cy.get(".select-trigger span").should("be.empty"); // Assignee select should be empty
  cy.get("sgc-text-area").find("textarea").should("be.empty"); // Comment input should be empty
}

export function checkWorkflowChangeContent(userName: string, statusChange: string, comment: string) {
  cy.get(".heading .highlight").should("contain", userName);
  cy.get("sgc-workflow-change-template li[slot='mutations']").should("contain", statusChange);
  cy.get("sgc-workflow-change-template div[slot='body']").should("contain", comment);
}

export function waitForTabStatusUpdate() {
  cy.wait(["@tabstatuschange", "@workflow_by_id", "@borehole_by_id"]);
}

function getTabStatusBox(tab: string, title: string) {
  return cy.get(`#${tab}`).find(".name").contains(title).siblings(".checkbox").children().eq(0);
}

export function clickTabStatusCheckbox(tab: string, title: string) {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(100);
  getTabStatusBox(tab, title).click();
  waitForTabStatusUpdate();
}
export function clickCheckAllCheckbox(tab: string) {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(100);
  cy.get(`#${tab}`).find(".checkbox").children().eq(0).click(); // Check all checkbox
  waitForTabStatusUpdate();
}

export function isCheckedTabStatusBox(tab: string, title: string) {
  getTabStatusBox(tab, title).should("have.class", "is-checked");
}

export function isIndeterminateTabStatusBox(tab: string, title: string) {
  getTabStatusBox(tab, title).should("have.class", "is-indeterminate");
}

export function isUncheckedTabStatusBox(tab: string, title: string) {
  getTabStatusBox(tab, title).should("have.attr", "aria-checked", "false");
}
