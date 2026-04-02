import { saveWithSaveBar } from "../helpers/buttonHelpers";
import { formatWithThousandsSeparator, setInput } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import { goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers";

export interface LayerInput {
  layerType: string;
  fromDepth: number;
  toDepth?: number | null;
  isGap?: boolean;
}

export interface HasLayerInput extends LayerInput {
  exists?: boolean;
}

export interface CheckLayerCardInput extends LayerInput {
  content: string[];
}

const layerSelector = ({ layerType, fromDepth, toDepth, isGap }: LayerInput) => {
  if (isGap) {
    return `[data-cy="${layerType}-${fromDepth}-0-gap"]`;
  }
  return `[data-cy^="${layerType}-"]:not([data-cy$="-gap"]):contains("${formatWithThousandsSeparator(fromDepth)} m MD"):contains("${formatWithThousandsSeparator(toDepth!)} m MD")`;
};

export enum LayerType {
  lithology = "lithology",
  lithologicalDescription = "lithologicalDescription",
  faciesDescription = "faciesDescription",
}

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

export const hasLayer = ({ layerType, fromDepth, toDepth, isGap, exists = true }: HasLayerInput) => {
  const selector = layerSelector({ layerType, fromDepth, toDepth, isGap });
  if (exists) {
    cy.get(selector).should("exist");
  } else {
    cy.get("body").find(selector).should("not.exist");
  }
};

export const deleteLayer = ({ layerType, fromDepth, toDepth }: LayerInput) => {
  cy.get(layerSelector({ layerType, fromDepth, toDepth })).realHover().dataCy("deleteLayer-button").click();
};

export const openLayer = ({ layerType, fromDepth, toDepth, isGap }: LayerInput) => {
  cy.get(layerSelector({ layerType, fromDepth, toDepth, isGap })).click();
};

export const closeLayerModal = () => {
  cy.dataCy("close-button").click();
};

export const checkLayerCardContent = ({ layerType, fromDepth, toDepth, content }: CheckLayerCardInput) => {
  content.forEach((text: string) => {
    cy.get(layerSelector({ layerType, fromDepth, toDepth })).contains(text);
  });
};

export const checkDepthColumn = (depths: [number, number][]) => {
  depths.forEach(([fromDepth, toDepth]) => {
    cy.dataCy(`depth-${fromDepth}-${toDepth}`).should("exist");
  });
};

export const hasDepthError = (fromDepth: number, toDepth: number, startError: boolean, endError: boolean) => {
  if (startError) {
    cy.dataCy(`depth-${fromDepth}-${toDepth}`)
      .contains(`${formatWithThousandsSeparator(fromDepth)} m MD`)
      .should("have.css", "color", "rgb(191, 31, 37)");
  }
  if (endError) {
    cy.dataCy(`depth-${fromDepth}-${toDepth}`)
      .contains(`${formatWithThousandsSeparator(toDepth)} m MD`)
      .should("have.css", "color", "rgb(191, 31, 37)");
  }
};
