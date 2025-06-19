import { addItem, deleteItem, saveForm } from "../helpers/buttonHelpers";
import { setInput } from "../helpers/formHelpers.js";
import { navigateInSidebar, SidebarMenuItem } from "../helpers/navigationHelpers.js";
import {
  getElementByDataCy,
  goToRouteAndAcceptTerms,
  newEditableBorehole,
  returnToOverview,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the lithological description column.", () => {
  it("Creates, updates and deletes lithological descriptions ", () => {
    goToRouteAndAcceptTerms(`/`);
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    navigateInSidebar(SidebarMenuItem.stratigraphy);
    addItem("addEmptyStratigraphy");
    cy.wait("@stratigraphy_POST");

    // add three layers
    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"]').should("contain", "0 m MD");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    setInput("fromDepth", "0");
    setInput("toDepth", "50");
    saveForm();
    cy.wait(["@update-layer", "@layer"]);
    cy.get('[data-cy="styled-layer-0"]').should("contain", "50 m MD");

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"]').should("contain", "0 m MD");
    cy.get('[data-cy="styled-layer-0"]').should("contain", "50 m MD");
    cy.get('[data-cy="styled-layer-1"]').should("contain", "50 m MD");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    setInput("toDepth", "62.5");
    saveForm();
    cy.wait(["@update-layer", "@layer"]);

    cy.get('[data-cy="add-layer-icon"]').click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"]').should("contain", "50 m MD");
    cy.get('[data-cy="styled-layer-1"]').should("contain", "62.5 m MD");
    cy.get('[data-cy="styled-layer-2"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    getElementByDataCy("show-all-fields-switch").click();
    setInput("toDepth", "120");
    saveForm();
    cy.wait(["@update-layer", "@layer"]);
    cy.get('[data-cy="styled-layer-0"]').should("contain", "50 m MD");
    cy.get('[data-cy="styled-layer-1"]').should("contain", "62.5 m MD");
    cy.get('[data-cy="styled-layer-2"]').should("contain", "120 m MD");

    // workaround because close button of profile attributes is sometimes not clickable
    navigateInSidebar(SidebarMenuItem.location);
    navigateInSidebar(SidebarMenuItem.stratigraphy);

    // add lithological description
    cy.wait("@layer");
    cy.get('[data-cy="add-litho-desc-icon"]').click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-0"]').contains("0 m");

    cy.get('[data-cy="description-0"] [data-testid="ModeEditIcon"] ').click();
    cy.get('[data-cy="description-textfield"]').find("textarea").first().click();
    cy.get('[data-cy="description-textfield"]').find("textarea").first().clear();
    cy.get('[data-cy="description-textfield"]').find("textarea").first().type("A new description.");

    // fill quality dropdown
    cy.get('[data-cy="qt-decription-select"]').find('[role="combobox"]').click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(5).click();

    // stop editing
    cy.get('[data-cy="description-0"] [data-testid="ClearIcon"]').click();

    cy.get('[data-cy="description-0"]').contains("0 m");
    cy.get('[data-cy="description-0"]').contains("A new description.");
    cy.get('[data-cy="description-0"]').contains("Quality of the description: very good");
    cy.get('[data-cy="description-0"]').contains("50 m");

    // add lithological description that stretches two layers
    cy.get('[data-cy="add-litho-desc-icon"]').click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-1"] [data-testid="ModeEditIcon"] ').click();

    // fill to depth dropdown
    cy.get('[data-cy="to-depth-select"]').find('[role="combobox"]').click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(1).click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-1"] [data-testid="ClearIcon"]').click();

    cy.get('[data-cy="description-1"]').should("have.css", "height", "280px");
    // delete last layer
    cy.get('[data-cy="description-1"] [data-testid="DeleteIcon"] ').click();

    deleteItem("description-button-box");
    cy.wait("@lithological_description"); // delete request
    cy.wait("@lithological_description"); // updated get request
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    // add two lithological descriptions
    cy.get('[data-cy="add-litho-desc-icon"]').click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-1"] [data-testid="ModeEditIcon"] ').click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-1"] [data-testid="ClearIcon"]').click();
    cy.wait("@lithological_description");
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    cy.get('[data-cy="add-litho-desc-icon"]').click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-2"] [data-testid="ModeEditIcon"] ').click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-2"] [data-testid="ClearIcon"]').click();
    cy.wait("@lithological_description");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(2000);

    // delete the one in the middle
    cy.get('[data-cy="description-1"] [data-testid="DeleteIcon"] ').click();

    // assert error message
    cy.get('[data-cy="description-1"]').contains("You are about to delete this layer, how do you want to proceed?");
    deleteItem("description-button-box");
    cy.wait("@lithological_description"); // delete request
    cy.wait("@lithological_description"); // updated get request
    cy.get('[data-cy="description-1"]').contains("There is an undefined interval in the sequence");
    // refill the middle
    cy.get('[data-cy="description-1"] [data-testid="AddCircleIcon"] ').click();

    // assert no error message
    cy.get('[data-cy="description-1"]').contains("Quality of the description: -");

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
  });
});
