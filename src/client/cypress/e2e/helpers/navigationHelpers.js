import { checkElementColorByDataCy, getElementByDataCy, handlePrompt } from "./testHelpers.js";

export const SidebarMenuItem = {
  location: "location",
  borehole: "borehole",
  stratigraphy: "stratigraphy",
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
  waterIngress: SidebarMenuItem.hydrogeology,
  groundwaterLevelMeasurement: SidebarMenuItem.hydrogeology,
  fieldMeasurement: SidebarMenuItem.hydrogeology,
  hydrotest: SidebarMenuItem.hydrogeology,
};

export const BoreholeTab = {
  general: "general",
  sections: "sections",
  geometry: "geometry",
};

export const StratigraphyTab = {
  lithology: "lithology",
  chronostratigraphy: "chronostratigraphy",
  lithostratigraphy: "lithostratigraphy",
};

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
      break;
    case BoreholeTab.geometry:
      cy.wait("@boreholegeometry_GET");
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

export const navigateInStratigraphy = tab => {
  getElementByDataCy(`${tab}-tab`).click();

  cy.location().should(location => {
    expect(location.pathname).to.match(/^\/\d+\/stratigraphy(\/|$)/);
    expect(location.hash).to.eq(`#${tab}`);
  });
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
  getElementByDataCy(`${menuItem}-menu-item`).click({ force: true });

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
      isActiveMenuItem(menuItem);
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/stratigraphy\/\d+$/);
        expect(location.hash).to.eq("#lithology");
      });
      break;
    case SidebarMenuItem.completion:
      cy.wait("@completion_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/completion$/);
      });
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
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.groundwaterLevelMeasurement:
      cy.wait("@groundwaterlevelmeasurement_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/groundwaterlevelmeasurement/);
      });
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.fieldMeasurement:
      cy.wait("@fieldmeasurement_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/fieldmeasurement/);
      });
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.hydrotest:
      cy.wait("@hydrotest_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/hydrogeology\/hydrotest/);
      });
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.attachments:
      cy.wait("@getAllAttachments");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/attachments$/);
        expect(location.hash).to.eq("#profiles");
      });
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.status:
      cy.wait("@workflow_edit_list");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/status$/);
      });
      cy.contains("Publication workflow");
      isActiveMenuItem(menuItem);
      break;
  }
};
