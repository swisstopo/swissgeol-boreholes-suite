import { saveWithSaveBar } from "../../helpers/buttonHelpers.js";
import {
  evaluateInput,
  evaluateSelect,
  isDisabled,
  setInput,
  setSelect,
  toggleCheckbox,
} from "../../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../../helpers/navigationHelpers.js";
import { goToRouteAndAcceptTerms, newEditableBorehole, stopBoreholeEditing } from "../../helpers/testHelpers.js";

describe("Lithology, Lithology descriptions, Facies descriptions tests", () => {
  it("adds and displays lithologies", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.dataCy("addemptystratigraphy-button").click();
    setInput("name", "New Stratigraphy");
    saveWithSaveBar();
    cy.wait(["@stratigraphy_POST", "@stratigraphy_by_borehole_GET"]);

    cy.dataCy("add-row-button").click();
    setInput("fromDepth", 0);
    setInput("toDepth", 35);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 9);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 3);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "fine gravel (FGr)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "stony / with stones (co)");
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("lithology-0").should("contain", "[FGr-co]: fine gravel, stony / with stones");
    cy.dataCy("lithologicalDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");

    cy.dataCy("lithology-0").click();
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 7);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "medium gravel (MGr)");
    cy.dataCy("close-button").click();
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");

    cy.dataCy("add-row-button").click();
    evaluateInput("fromDepth", 35);
    setInput("toDepth", 79);

    cy.dataCy("shareInverse-formInput").should("not.exist");
    isDisabled("share");
    toggleCheckbox("hasBedding");
    isDisabled("share", false);
    cy.dataCy("shareInverse-formInput").should("exist");
    isDisabled("shareInverse");

    setInput("share", 70);
    evaluateInput("shareInverse", 30);
    setSelect("lithologyDescriptions.0.lithologyUnconMainId", 2);
    setSelect("lithologyDescriptions.0.lithologyUncon2Id", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyUnconMainId", "boulder (Bo)");
    evaluateSelect("lithologyDescriptions.0.lithologyUncon2Id", "blocky / with blocks (bo)");
    setSelect("lithologyDescriptions.1.lithologyUnconMainId", 3);
    setSelect("lithologyDescriptions.1.lithologyUncon2Id", 4);
    evaluateSelect("lithologyDescriptions.1.lithologyUnconMainId", "cobbles (Co)");
    evaluateSelect("lithologyDescriptions.1.lithologyUncon2Id", "gravelly (gr)");
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithologicalDescription-0-0-gap").should("exist");
    cy.dataCy("lithologicalDescription-35-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-35-0-gap").should("not.exist");

    cy.dataCy("add-row-button").click();
    evaluateInput("fromDepth", 79);
    setInput("toDepth", 86);
    cy.get("button").contains("Consolidated rock").click();

    setSelect("lithologyDescriptions.0.lithologyConId", 4);
    setSelect("lithologyDescriptions.0.gradationId", 2);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "psephite");
    evaluateSelect("lithologyDescriptions.0.gradationId", "well sorted");
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "psephite, well sorted");
    cy.dataCy("lithologicalDescription-0-0-gap").should("exist");
    cy.dataCy("lithologicalDescription-35-0-gap").should("not.exist");
    cy.dataCy("lithologicalDescription-79-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-35-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-79-0-gap").should("not.exist");

    cy.dataCy("lithology-2").click();
    setSelect("lithologyDescriptions.0.lithologyConId", 5);
    evaluateSelect("lithologyDescriptions.0.lithologyConId", "breccia");
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0-0-gap").should("exist");
    cy.dataCy("lithologicalDescription-35-0-gap").should("not.exist");
    cy.dataCy("lithologicalDescription-79-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-35-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-79-0-gap").should("not.exist");

    cy.dataCy("lithologicalDescription-0-0-gap").click();
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 0, 3);
    setSelect("toDepth", 0, 3);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0-0-gap").should("not.exist");
    cy.dataCy("lithologicalDescription-0").should("exist");
    cy.dataCy("lithologicalDescription-35-0-gap").should("exist");
    cy.dataCy("lithologicalDescription-79-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-35-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-79-0-gap").should("not.exist");

    cy.dataCy("lithologicalDescription-35-0-gap").click();
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 0, 2);
    setSelect("toDepth", 1, 2);
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0-0-gap").should("not.exist");
    cy.dataCy("lithologicalDescription-0").should("exist");
    cy.dataCy("lithologicalDescription-35-0-gap").should("not.exist");
    cy.dataCy("lithologicalDescription-1").should("exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-35-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-79-0-gap").should("not.exist");

    cy.dataCy("faciesDescription-0-0-gap").click();
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 86);
    setSelect("fromDepth", 1, 3);
    setSelect("toDepth", 2, 3);
    evaluateSelect("fromDepth", 35);
    evaluateSelect("toDepth", 86);
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0").should("exist");
    cy.dataCy("lithologicalDescription-1").should("exist");
    cy.dataCy("faciesDescription-0-0-gap").should("exist");
    cy.dataCy("faciesDescription-1").should("exist");

    cy.dataCy("faciesDescription-0-0-gap").click();
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    setSelect("fromDepth", 0, 1);
    setSelect("toDepth", 0, 1);
    evaluateSelect("fromDepth", 0);
    evaluateSelect("toDepth", 35);
    setSelect("faciesId", 2);
    evaluateSelect("faciesId", "alluvial");
    cy.dataCy("close-button").click();

    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0").should("exist");
    cy.dataCy("lithologicalDescription-1").should("exist");
    cy.dataCy("faciesDescription-0-0-gap").should("not.exist");
    cy.dataCy("faciesDescription-0").should("contains", "alluvial");
    cy.dataCy("faciesDescription-1").should("exist");

    saveWithSaveBar();
    cy.dataCy("chronostratigraphy-tab").click();
    cy.dataCy("lithology-tab").click();
    cy.dataCy("depth-0-35").should("exist");
    cy.dataCy("depth-35-79").should("exist");
    cy.dataCy("depth-79-86").should("exist");
    cy.dataCy("lithology-0").should("contain", "[MGr-co]: medium gravel, stony / with stones");
    cy.dataCy("lithology-1").should("contain", "70% [Bo-bo]: boulder, blocky / with blocks");
    cy.dataCy("lithology-1").should("contain", "30% [Co-gr]: cobbles, gravelly");
    cy.dataCy("lithology-2").should("contain", "breccia, well sorted");
    cy.dataCy("lithologicalDescription-0").should("exist");
    cy.dataCy("lithologicalDescription-1").should("exist");
    cy.dataCy("faciesDescription-0").should("contains", "alluvial");
    cy.dataCy("faciesDescription-1").should("exist");
  });

  it("adds and displays facies description", () => {
    goToRouteAndAcceptTerms(`/`);
    newEditableBorehole().as("borehole_id");
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    cy.dataCy("addemptystratigraphy-button").click();
    setInput("name", "New Stratigraphy");
    saveWithSaveBar();
    cy.wait(["@stratigraphy_POST", "@stratigraphy_by_borehole_GET"]);
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
