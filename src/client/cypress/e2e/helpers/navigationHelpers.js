import { checkElementColorByDataCy, getElementByDataCy, handlePrompt } from "./testHelpers.js";

const noContentColor = "rgb(130, 142, 154)";
const contentColor = "rgb(28, 40, 52)";

export const isActiveTab = tab => {
  getElementByDataCy(tab).should("have.css", "color", "rgb(166, 84, 98)");
};

export const isInactiveTab = (tab, hasContent) => {
  if (hasContent === true) {
    checkElementColorByDataCy(tab, contentColor);
  } else if (hasContent === false) {
    checkElementColorByDataCy(tab, noContentColor);
  }
};

export const isActiveBoreholeTab = tab => {
  isActiveTab(`${tab}-tab`);
};
export const isInactiveBoreholeTab = (tab, hasContent) => {
  isInactiveTab(`${tab}-tab`, hasContent);
};

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
    expect(location.pathname).to.match(/^\/[^/]+\/borehole$/);
    expect(location.hash).to.eq(`#${tab}`);
  });

  isActiveBoreholeTab(tab);
};

export const SidebarMenuItem = {
  location: "location",
  borehole: "borehole",
  stratigraphy: "stratigraphy",
  lithology: "lithology",
  chronostratigraphy: "chronostratigraphy",
  lithostratigraphy: "lithostratigraphy",
  completion: "completion",
  hydrogeology: "hydrogeology",
  waterIngress: "wateringress",
  groundwaterLevelMeasurement: "groundwaterlevelmeasurement",
  fieldMeasurement: "fieldmeasurement",
  hydrotest: "hydrotest",
  attachments: "attachments",
  status: "status",
};

const sidebarParentMap = {
  lithology: SidebarMenuItem.stratigraphy,
  chronostratigraphy: SidebarMenuItem.stratigraphy,
  lithostratigraphy: SidebarMenuItem.stratigraphy,
  waterIngress: SidebarMenuItem.hydrogeology,
  groundwaterLevelMeasurement: SidebarMenuItem.hydrogeology,
  fieldMeasurement: SidebarMenuItem.hydrogeology,
  hydrotest: SidebarMenuItem.hydrogeology,
};

const checkThatParentOpen = menuItem => {
  const parent = sidebarParentMap[menuItem];
  if (parent) {
    // If child is not visible, click parent to expand
    getElementByDataCy(`${menuItem}-menu-item`).should($el => {
      if (!$el.is(":visible")) {
        navigateInSidebar(parent);
      }
    });
  }
};

export const isActiveMenuItem = (menuItem, hasContent) => {
  const selector = `${menuItem}-menu-item`;
  getElementByDataCy(selector).parent().should("have.css", "border-left-color", "rgb(153, 25, 30)");

  if (hasContent === true) {
    checkElementColorByDataCy(selector, "rgb(153, 25, 30)");
  } else if (hasContent === false) {
    checkElementColorByDataCy(selector, noContentColor);
  }
};

export const isMenuItemWithContent = menuItem => {
  checkThatParentOpen(menuItem);
  checkElementColorByDataCy(`${menuItem}-menu-item`, contentColor);
};

export const isMenuItemWithoutContent = menuItem => {
  checkThatParentOpen(menuItem);
  checkElementColorByDataCy(`${menuItem}-menu-item`, noContentColor);
};

export const navigateInSidebar = (menuItem, promptSelector) => {
  checkThatParentOpen(menuItem);
  getElementByDataCy(`${menuItem}-menu-item`).click();

  if (promptSelector) {
    handlePrompt(null, promptSelector);
  }

  switch (menuItem) {
    case SidebarMenuItem.location:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/location$/);
      });
      getElementByDataCy("borehole_identifier-formInput").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.borehole:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/borehole$/);
        expect(location.hash).to.eq("#general");
      });
      getElementByDataCy("typeId-formSelect").should("exist");
      isActiveBoreholeTab(BoreholeTab.general);
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.stratigraphy:
      getElementByDataCy("lithology-menu-item").should("be.visible");
      getElementByDataCy("chronostratigraphy-menu-item").should("be.visible");
      getElementByDataCy("lithostratigraphy-menu-item").should("be.visible");
      break;
    case SidebarMenuItem.lithology:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/stratigraphy\/lithology$/);
      });
      getElementByDataCy("name-formInput").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.chronostratigraphy:
      cy.wait("@get-layers-by-profileId");
      cy.wait("@chronostratigraphy_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/stratigraphy\/chronostratigraphy$/);
      });
      getElementByDataCy("stratigraphy-select").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.lithostratigraphy:
      cy.wait("@get-layers-by-profileId");
      cy.wait("@lithostratigraphy_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/stratigraphy\/lithostratigraphy$/);
      });
      getElementByDataCy("stratigraphy-select").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.completion:
      cy.wait("@get-completions-by-boreholeId");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/completion$/);
      });
      getElementByDataCy("addcompletion-button").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.hydrogeology:
      getElementByDataCy("wateringress-menu-item").should("be.visible");
      getElementByDataCy("groundwaterlevelmeasurement-menu-item").should("be.visible");
      getElementByDataCy("fieldmeasurement-menu-item").should("be.visible");
      getElementByDataCy("hydrotest-menu-item").should("be.visible");
      break;
    case SidebarMenuItem.waterIngress:
      cy.wait("@wateringress_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/wateringress/);
      });
      getElementByDataCy("addwateringress-button").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.groundwaterLevelMeasurement:
      cy.wait("@groundwaterlevelmeasurement_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/groundwaterlevelmeasurement/);
      });
      getElementByDataCy("addgroundwaterlevelmeasurement-button").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.fieldMeasurement:
      cy.wait("@fieldmeasurement_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/fieldmeasurement/);
      });
      getElementByDataCy("addfieldmeasurement-button").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.hydrotest:
      cy.wait("@hydrotest_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/hydrotest/);
      });
      getElementByDataCy("addhydrotest-button").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.attachments:
      cy.wait("@getAllAttachments");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/attachments$/);
        expect(location.hash).to.eq("#profiles");
      });
      getElementByDataCy("attachments-menu-item").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.status:
      cy.wait("@workflow_edit_list");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/status$/);
      });
      getElementByDataCy("workflow-menu-item").should("exist");
      isActiveMenuItem(menuItem);
      break;
  }
};
