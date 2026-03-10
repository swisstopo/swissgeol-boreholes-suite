import { saveWithSaveBar } from "../../helpers/buttonHelpers.js";
import { evaluateSelect, setInput, setSelect } from "../../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../../helpers/navigationHelpers.js";
import { goToRouteAndAcceptTerms, newEditableBorehole, stopBoreholeEditing } from "../../helpers/testHelpers.js";

describe("Lithology, Lithology descriptions, Facies descriptions tests", () => {
  it("adds and displays facies description", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.dataCy("addemptystratigraphy-button").click();
    setInput("name", "New Stratigraphy");
    saveWithSaveBar();
    cy.dataCy("add-row-button").click();
    setInput("fromDepth", 1);
    setInput("toDepth", 134);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 2);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "fine gravelly (fgr)");
    cy.dataCy("close-button").click();
    cy.dataCy("faciesDescription-1-0-add-button").click();
    setSelect("faciesId", 1);
    evaluateSelect("faciesId", "terrestrial");
    cy.dataCy("close-button").click();
    saveWithSaveBar();
    stopBoreholeEditing();
    cy.dataCy("faciesDescription-0").should("contain", "terrestrial");
  });
});
