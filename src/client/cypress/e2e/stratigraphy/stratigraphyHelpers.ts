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

interface DragResizeDescriptionInput {
  kind: "lithological" | "facies";
  fromDepth: number;
  toDepth: number;
  side: "top" | "bottom";
  deltaRows: number; // How many depth-row heights to drag. Positive = downward (towards larger depths).
  rowHeight?: number; // Depth-row pixel height. Defaults to 240 (`defaultRowHeight` in `lithologyTableUtils.ts`).
}

export const dragResizeDescription = ({
  kind,
  fromDepth,
  toDepth,
  side,
  deltaRows,
  rowHeight = 240,
}: DragResizeDescriptionInput) => {
  const columnPrefix = kind === "lithological" ? "lithologicalDescription" : "faciesDescription";
  const cellSelector = `[data-cy="${columnPrefix}-${fromDepth}-${toDepth}"]`;
  const handleSelector = `[data-cy="resize-description-${kind}-${side}-${fromDepth}-${toDepth}"]`;
  cy.get(cellSelector).realHover();
  cy.get(handleSelector).then($handle => {
    const rect = $handle[0].getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const endY = startY + deltaRows * rowHeight;
    cy.get(handleSelector).trigger("mousedown", { clientX: startX, clientY: startY, button: 0 });
    cy.get("body").trigger("mousemove", { clientX: startX, clientY: endY });
    cy.get("body").trigger("mouseup", { clientX: startX, clientY: endY });
  });
};

export const insertDepthRow = (fromDepth: number, toDepth: number, position: "above" | "below") => {
  cy.get(`[data-cy="depth-${fromDepth}-${toDepth}"]`).realHover({ position: position === "above" ? "top" : "bottom" });
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

export const hasDepthError = (fromDepth: number, toDepth: number) => {
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).find(".Mui-error").should("exist");
};

export const hasNoDepthError = (fromDepth: number, toDepth: number) => {
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).find(".Mui-error").should("not.exist");
};
