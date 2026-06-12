import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers";
import { goToRouteAndAcceptTerms, newEditableBorehole } from "../helpers/testHelpers";

interface LayerInput {
  layerType: string;
  fromDepth: number | null;
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

type DescriptionKind = "lithological" | "facies";

const descriptionColumn: Record<DescriptionKind, LayerType> = {
  lithological: LayerType.lithologicalDescription,
  facies: LayerType.faciesDescription,
};

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

export const setDepth = (
  currentFromDepth: number | null,
  currentToDepth: number | null,
  side: "from" | "to",
  newDepth: number,
) => {
  const selector = `[data-cy="depth-${side}-${currentFromDepth}-${currentToDepth}-input"]`;
  cy.get(selector).clear();
  cy.get(selector).type(`${newDepth}{enter}`);
};

export const insertDepthRow = (fromDepth: number | null, toDepth: number | null, position: "before" | "after") => {
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).scrollIntoView();
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).realHover({ position: position === "before" ? "top" : "bottom" });
  cy.dataCy(`insert-depth-${position}-${fromDepth}-${toDepth}-button`).click({ force: true });
};

interface VerticalDragByRowsInput {
  grabSelector: string; // Element to press on and measure from.
  deltaRows: number; // How many depth-row heights to drag. Positive = downward (towards larger depths).
  duringDrag?: () => void; // Optional action after mousemove and before mouseup (e.g. press Escape).
}

const verticalDragByRows = ({ grabSelector, deltaRows, duringDrag }: VerticalDragByRowsInput) => {
  // Resize handles are only 3px tall, so a Cypress auto-scroll between rect capture and the
  // mousedown dispatch can land the click outside the handle entirely. Disable scrollBehavior
  // and capture coordinates immediately before each dispatch so the synthetic clientX/Y always
  // match the element's *current* viewport position.
  cy.get(grabSelector).then($el => {
    const handle = $el[0];
    const rect = handle.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    cy.wrap(handle).trigger("mousedown", {
      clientX: startX,
      clientY: startY,
      button: 0,
      scrollBehavior: false,
    });

    // Find the target depth row by DOM hit-testing *after* the mousedown has landed, so any
    // intermediate scroll changes are reflected in the row positions we use for endY.
    cy.document().then(doc => {
      const depthRows = Array.from(doc.querySelectorAll<HTMLElement>('[data-cy^="depth-"]'))
        .map(el => {
          const attr = el.getAttribute("data-cy") ?? "";
          const m = attr.match(/^depth-([\d.]+|null)-([\d.]+|null)$/);
          return m ? { el, from: Number.parseFloat(m[1]), to: Number.parseFloat(m[2]) } : null;
        })
        .filter((r): r is { el: HTMLElement; from: number; to: number } => r !== null);

      // Find the depth row closest to the grab element's *current* vertical center.
      const handleRect = handle.getBoundingClientRect();
      const handleCenterY = handleRect.top + handleRect.height / 2;
      let closestIdx = 0;
      let closestDist = Infinity;
      depthRows.forEach((r, i) => {
        const rowRect = r.el.getBoundingClientRect();
        const rowCenterY = rowRect.top + rowRect.height / 2;
        const dist = Math.abs(rowCenterY - handleCenterY);
        if (dist < closestDist) {
          closestDist = dist;
          closestIdx = i;
        }
      });

      const targetRow = depthRows[closestIdx + deltaRows];
      const targetRect = targetRow.el.getBoundingClientRect();
      const endY = targetRect.top + targetRect.height / 2;

      cy.get("body").trigger("mousemove", { clientX: startX, clientY: endY, scrollBehavior: false });
      duringDrag?.();
      cy.get("body").trigger("mouseup", { clientX: startX, clientY: endY, scrollBehavior: false });
    });
  });
};

interface DragResizeDescriptionInput {
  kind: DescriptionKind;
  fromDepth: number | null;
  toDepth: number | null;
  side: "top" | "bottom";
  deltaRows: number;
}

export const dragResizeDescription = ({ kind, fromDepth, toDepth, side, deltaRows }: DragResizeDescriptionInput) => {
  const columnPrefix = descriptionColumn[kind];
  const cellSelector = `[data-cy="${columnPrefix}-${fromDepth}-${toDepth}"]`;
  const handleSelector = `[data-cy="resize-description-${kind}-${side}-${fromDepth}-${toDepth}"]`;
  cy.get(cellSelector).realHover();
  verticalDragByRows({ grabSelector: handleSelector, deltaRows });
};

interface DragSelectDescriptionGapsInput {
  kind: DescriptionKind;
  fromDepth: number;
  deltaRows: number;
}

const descriptionGapSelector = (kind: DescriptionKind, fromDepth: number) =>
  `[data-cy^="${descriptionColumn[kind]}-${fromDepth}-"][data-cy$="-gap"]`;

export const dragSelectDescriptionGaps = ({ kind, fromDepth, deltaRows }: DragSelectDescriptionGapsInput) => {
  verticalDragByRows({ grabSelector: descriptionGapSelector(kind, fromDepth), deltaRows });
};

export const cancelDragSelectDescriptionGaps = ({ kind, fromDepth, deltaRows }: DragSelectDescriptionGapsInput) => {
  verticalDragByRows({
    grabSelector: descriptionGapSelector(kind, fromDepth),
    deltaRows,
    duringDrag: () => cy.get("body").trigger("keydown", { key: "Escape" }),
  });
};

export const hasLayer = ({ layerType, fromDepth, toDepth, isGap, exists = true }: HasLayerInput) => {
  const selector = layerSelector({ layerType, fromDepth, toDepth, isGap });
  if (exists) {
    cy.get(selector).should("exist");
  } else {
    cy.get("body").find(selector).should("not.exist");
  }
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

export const hasDepthError = (fromDepth: number | null, toDepth: number | null) => {
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).find(".Mui-error").should("exist");
};

export const hasNoDepthError = (fromDepth: number | null, toDepth: number | null) => {
  cy.dataCy(`depth-${fromDepth}-${toDepth}`).find(".Mui-error").should("not.exist");
};
