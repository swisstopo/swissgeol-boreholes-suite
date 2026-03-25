import { saveWithSaveBar } from "../helpers/buttonHelpers.js";
import { formatWithThousandsSeparator, setInput } from "../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import { goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers.js";

const layerSelector = (layerType, fromDepth, toDepth, isGap = false) => {
  if (isGap) {
    return cy.dataCy(`${layerType}-${fromDepth}-0-gap`);
  }
  return cy.get(
    `[data-cy^="${layerType}-"]:not([data-cy$="-gap"]):contains("${formatWithThousandsSeparator(fromDepth)} m MD"):contains("${formatWithThousandsSeparator(toDepth)} m MD")`,
  );
};

export const LayerType = {
  lithology: "lithology",
  lithologicalDescription: "lithologicalDescription",
  faciesDescription: "faciesDescription",
};

export const openNewStratigraphy = () => {
  goToRouteAndAcceptTerms(`/`);
  newEditableBorehole().as("borehole_id");
  navigateInSidebar(SidebarMenuItem.stratigraphy);
  cy.dataCy("addemptystratigraphy-button").click();
  setInput("name", "New Stratigraphy");
  saveWithSaveBar();
  cy.wait(["@stratigraphy_POST", "@stratigraphy_by_borehole_GET"]);
};

export const addLithology = () => {
  cy.dataCy("add-row-button").click();
};

export const hasLayer = (layerType, fromDepth, toDepth, isGap = false, exists = true) => {
  layerSelector(layerType, fromDepth, toDepth, isGap).should(exists ? "exist" : "not.exist");
};

export const openLayer = (layerType, fromDepth, toDepth, isGap = false) => {
  layerSelector(layerType, fromDepth, toDepth, isGap).click();
};

export const closeLayerModal = () => {
  cy.dataCy("close-button").click();
};

export const checkLayerCardContent = (layerType, fromDepth, toDepth, content) => {
  content.forEach(text => {
    layerSelector(layerType, fromDepth, toDepth).contains(text);
  });
};

export const checkDepthColumn = depths => {
  depths.forEach(([fromDepth, toDepth]) => {
    cy.dataCy(`depth-${fromDepth}-${toDepth}`).should("exist");
  });
};
