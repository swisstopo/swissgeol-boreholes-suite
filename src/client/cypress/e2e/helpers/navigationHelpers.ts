import { checkElementColorByDataCy, createBaseSelector, handlePrompt } from "./testHelpers";
import "cypress-real-events/support";

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
  log: "log",
  attachments: "attachments",
  status: "status",
};

const sidebarParentMap: Record<string, string> = {
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
export const activeColor = "rgb(166, 84, 98)";

export const checkTabsByTitles = (tabs: { title: string; active?: boolean }[], parent?: string, datacy?: string) => {
  const selector = createBaseSelector(parent) + `.MuiTabs-list`;
  let tabSelector = ".MuiTab-root";
  if (datacy) {
    tabSelector = `.MuiTab-root[data-cy^="${datacy}"]`;
  }
  cy.get(selector)
    .find(tabSelector)
    .should($tabs => {
      expect($tabs).to.have.length(tabs.length);
      $tabs.each((i, tab) => {
        expect(tab).to.have.text(tabs[i].title);
        if (tabs[i].active) {
          expect(tab.classList.contains("Mui-selected")).to.equal(true);
          expect(getComputedStyle(tab).color).to.eq(activeColor);
        } else {
          expect(tab.classList.contains("Mui-selected")).to.equal(false);
          expect(getComputedStyle(tab).color).to.eq(contentColor);
        }
      });
    });
};

export const navigateToTabWithTitle = (title: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `.MuiTabs-list`;
  cy.get(selector).contains(title).click();
  cy.get(selector).contains(title).should("have.class", "Mui-selected");
};

export const isActiveTab = (tab: string) => {
  checkElementColorByDataCy(`${tab}-tab`, activeColor);
};

export const isInactiveEmptyTab = (tab: string) => {
  checkElementColorByDataCy(`${tab}-tab`, noContentColor);
};

export const isInactiveTabWithContent = (tab: string) => {
  checkElementColorByDataCy(`${tab}-tab`, contentColor);
};

export const navigateInBorehole = (tab: string, promptSelector?: string) => {
  cy.dataCy(`${tab}-tab`).click();
  if (promptSelector) {
    handlePrompt(null, promptSelector);
  }

  switch (tab) {
    case BoreholeTab.general:
      cy.dataCy("typeId-formSelect").should("exist");
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

  isActiveTab(tab);
};

export const navigateInStratigraphy = (tab: string) => {
  cy.dataCy(`${tab}-tab`).click();

  switch (tab) {
    case StratigraphyTab.lithology:
      cy.wait(["@lithology_by_stratigraphyId_GET", "@lithological_description", "@facies_description"]);
      break;
    case StratigraphyTab.chronostratigraphy:
      cy.wait("@chronostratigraphy_GET");
      break;
    case StratigraphyTab.lithostratigraphy:
      cy.wait("@lithostratigraphy_GET");
      break;
  }

  cy.location().should(location => {
    expect(location.pathname).to.match(/^\/\d+\/stratigraphy(\/|$)/);
    expect(location.hash).to.eq(`#${tab}`);
  });

  cy.dataCy(`${tab}-tab`).should("have.class", "Mui-selected");
};

const checkThatParentOpen = (menuItem: string) => {
  const parent = sidebarParentMap[menuItem];
  if (parent) {
    cy.dataCy(`${menuItem}-menu-item`).should("be.visible");
  }
};

export const isActiveMenuItem = (menuItem: string, hasContent?: boolean) => {
  const selector = `${menuItem}-menu-item`;
  cy.dataCy(selector).should("have.css", "border-left-color", activeColor);

  if (hasContent === true) {
    checkElementColorByDataCy(selector, activeColor);
  } else if (hasContent === false) {
    checkElementColorByDataCy(selector, noContentColor);
  }
};

export const isMenuItemWithContent = (menuItem: string) => {
  checkThatParentOpen(menuItem);
  checkElementColorByDataCy(`${menuItem}-menu-item`, contentColor);
};

export const isMenuItemWithoutContent = (menuItem: string) => {
  checkThatParentOpen(menuItem);
  checkElementColorByDataCy(`${menuItem}-menu-item`, noContentColor);
};

export const navigateInSidebar = (menuItem: string, promptSelector?: string) => {
  checkThatParentOpen(menuItem);
  cy.dataCy(`${menuItem}-menu-item`).should("be.visible");
  cy.dataCy(`${menuItem}-menu-item`).realClick();

  if (promptSelector) {
    handlePrompt(null, promptSelector);
  }

  switch (menuItem) {
    case SidebarMenuItem.location:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/location$/);
      });
      cy.dataCy("borehole_identifier-formInput").should("exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.borehole:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/borehole$/);
        expect(location.hash).to.eq("#general");
      });
      cy.dataCy("typeId-formSelect").should("exist");
      isActiveTab(BoreholeTab.general);
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.stratigraphy:
      isActiveMenuItem(menuItem);
      cy.get(".MuiCircularProgress-root").should("not.exist");
      cy.location().should(location => {
        if (!location.hash) {
          // No stratigraphy
          expect(location.pathname).to.match(/^\/\d+\/stratigraphy$/);
        } else {
          expect(location.pathname).to.match(/^\/\d+\/stratigraphy\/\d+$/);
          expect(location.hash).to.eq("#lithology");
        }
      });
      break;
    case SidebarMenuItem.completion:
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/completion$/);
      });
      cy.get(".MuiCircularProgress-root").should("not.exist");
      isActiveMenuItem(menuItem);
      break;
    case SidebarMenuItem.hydrogeology:
      cy.dataCy("wateringress-menu-item").should("be.visible");
      cy.dataCy("groundwaterlevelmeasurement-menu-item").should("be.visible");
      cy.dataCy("fieldmeasurement-menu-item").should("be.visible");
      cy.dataCy("hydrotest-menu-item").should("be.visible");
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
    case SidebarMenuItem.log:
      cy.wait("@logrun_by_borehole_GET");
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/log$/);
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
      cy.location().should(location => {
        expect(location.pathname).to.match(/^\/\d+\/status$/);
      });
      cy.get("sgc-workflow").should("exist");
      isActiveMenuItem(menuItem);
      break;
  }
};
