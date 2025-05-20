import { getElementByDataCy, handlePrompt } from "./testHelpers.js";

export const BoreholeTab = {
  general: "general",
  sections: "sections",
  geometry: "geometry",
};

export const navigateInBorehole = (tab, promptSelector) => {
  getElementByDataCy(`${tab}-tab`).click();
  if (promptSelector) {
    handlePrompt(null, promptSelector);
  }

  switch (tab) {
    case BoreholeTab.general:
      getElementByDataCy("typeId-formSelect").should("exist");
      break;
    case BoreholeTab.sections:
      cy.wait("@section_GET");
      getElementByDataCy("addsection-button").should("exist");
      break;
    case BoreholeTab.geometry:
      cy.wait("@boreholegeometry_GET");
      cy.wait("@boreholegeometry_formats");
      getElementByDataCy("geometryFormat-formSelect").should("exist");
      break;
    default:
      break;
  }

  cy.location().should(location => {
    expect(location.hash).to.eq(`#${tab}`);
  });
};
