import { formatWithThousandsSeparator } from "../helpers/formHelpers";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import { goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers";

interface LayerInput {
  layerType: string;
  fromDepth: number;
  toDepth?: number | null;
  isGap?: boolean;
}

interface HasLayerInput extends LayerInput {
  exists?: boolean;
}

interface CheckLayerCardInput extends LayerInput {
  content: string[];
}

const layerSelector = ({ layerType, fromDepth, toDepth, isGap }: LayerInput) => {
  if (isGap) {
    // Gap cells have data-cy `${layerType}-${fromDepth}-${depthId}-gap` where depthId is a
    // UUID — match by `${layerType}-${fromDepth}-` prefix + `-gap` suffix.
    return `[data-cy^="${layerType}-${fromDepth}-"][data-cy$="-gap"]`;
  }
  return `[data-cy="${layerType}-${fromDepth}-${toDepth}"]`;
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
  cy.dataCy("stratigraphy-name-formInput").type("New Stratigraphy");
  cy.dataCy("addemptystratigraphy-submit-button").click();
  cy.wait(["@stratigraphy_POST", "@stratigraphy_by_borehole_GET"]);
};

export const addLithology = () => {
  cy.dataCy("add-row-button").click();
};

export const setDepth = (currentFromDepth: number, currentToDepth: number, side: "from" | "to", newDepth: number) => {
  const selector = `[data-cy="depth-${side}-${currentFromDepth}-${currentToDepth}-input"]`;
  cy.get(selector).clear();
  cy.get(selector).type(`${newDepth}{enter}`);
};

/**
 * Insert a zero-thickness depth row via the small `+` button on the upper or lower edge of
 * a depth cell. The buttons are hover-revealed, so the cell is hovered first to expose them.
 *   - `"above"` inserts at the cell's fromDepth (use to add a row at the top of the table or
 *     just above the targeted cell).
 *   - `"below"` inserts at the cell's toDepth (use to add a row at the bottom of the table or
 *     just below the targeted cell).
 */
export const insertDepthRow = (fromDepth: number, toDepth: number, position: "above" | "below") => {
  cy.get(`[data-cy="depth-${fromDepth}-${toDepth}"]`).realHover();
  cy.dataCy(`insert-depth-${position}-${fromDepth}-${toDepth}-button`).click();
};

export const hasLayer = ({ layerType, fromDepth, toDepth, isGap, exists = true }: HasLayerInput) => {
  const selector = layerSelector({ layerType, fromDepth, toDepth, isGap });
  if (exists) {
    cy.get(selector).should("exist");
  } else {
    cy.get("body").find(selector).should("not.exist");
  }
};

export const hasAutoCorrectedStyle = ({ layerType, fromDepth, toDepth }: LayerInput) => {
  cy.get(layerSelector({ layerType, fromDepth, toDepth })).should("have.css", "background-color", "rgb(255, 214, 192)");
};

export const hasGapsAt = (layerType: LayerType, fromDepths: number[]) => {
  fromDepths.forEach(fromDepth => hasLayer({ layerType, fromDepth, isGap: true }));
};

export const hasLayersAt = (layerType: LayerType, depths: [number, number][]) => {
  depths.forEach(([fromDepth, toDepth]) => hasLayer({ layerType, fromDepth, toDepth }));
};

export const deleteLayer = ({ layerType, fromDepth, toDepth }: LayerInput) => {
  cy.get(layerSelector({ layerType, fromDepth, toDepth })).realHover().dataCy("deleteLayer-button").click();
};

export const openLayer = ({ layerType, fromDepth, toDepth, isGap }: LayerInput) => {
  cy.get(layerSelector({ layerType, fromDepth, toDepth, isGap })).click();
};

export const closeLayerModal = () => {
  cy.dataCy("apply-button").click();
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
