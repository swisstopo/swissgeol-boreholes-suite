// adds updates and deletes stratigraphies, makes them primary and unselect other when one is primary
import { addStratigraphy } from "../helpers/buttonHelpers";
import { evaluateInput, evaluateSelect, setInput, setSelect } from "../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  getElementByDataCy,
  goToDetailRouteAndAcceptTerms,
  handlePrompt,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for stratigraphy", () => {
  it("adds, updates, copies and deletes stratigraphies", () => {
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
