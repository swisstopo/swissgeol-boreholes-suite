import { addItem, deleteItem } from "../helpers/buttonHelpers";
import {
  newEditableBorehole,
  returnToOverview,
  selectByDataCyAttribute,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Tests for the lithological description column.", () => {
  it("Creates, updates and deletes lithological descriptions ", () => {
    // create boreholes
    newEditableBorehole().as("borehole_id");

    // navigate to stratigraphy
    selectByDataCyAttribute("stratigraphy-menu-item").click();
    selectByDataCyAttribute("lithology-menu-item").click();
    addItem("addStratigraphy");
    cy.wait("@stratigraphy_POST");

    // add three layers
    selectByDataCyAttribute("add-layer-icon").click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    cy.contains("Show all fields").children(".checkbox").click();
    selectByDataCyAttribute("toDepth").click().clear().type(50);
    cy.wait("@update-layer");
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-0"] [data-testid="ClearIcon"]').click();

    selectByDataCyAttribute("add-layer-icon").click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    cy.contains("Show all fields").children(".checkbox").click();
    selectByDataCyAttribute("toDepth").click().clear().type(62.5);
    cy.wait("@update-layer");
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-1"] [data-testid="ClearIcon"]').click();

    selectByDataCyAttribute("add-layer-icon").click();
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-2"] [data-testid="ModeEditIcon"]').click();
    cy.wait("@get-layer-by-id");
    cy.contains("Show all fields").children(".checkbox").click();
    selectByDataCyAttribute("toDepth").click().clear().type(120);
    cy.wait("@update-layer");
    cy.wait("@layer");
    cy.get('[data-cy="styled-layer-2"] [data-testid="ClearIcon"]').click();

    // workaround because close button of profile attributes is sometimes not clickable
    selectByDataCyAttribute("location-menu-item").click();
    selectByDataCyAttribute("stratigraphy-menu-item").click();
    selectByDataCyAttribute("lithology-menu-item").click();

    // add lithological description
    cy.wait("@layer");
    selectByDataCyAttribute("add-litho-desc-icon").click();
    cy.wait("@lithological_description");
    selectByDataCyAttribute("description-0").contains("0 m");

    cy.get('[data-cy="description-0"] [data-testid="ModeEditIcon"] ').click();
    selectByDataCyAttribute("description-textfield")
      .find("textarea")
      .first()
      .click()
      .clear()
      .type("A new description.");

    // fill quality dropdown
    selectByDataCyAttribute("qt-decription-select").find('[role="combobox"]').click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(5).click();

    // stop editing
    cy.get('[data-cy="description-0"] [data-testid="ClearIcon"]').click();

    selectByDataCyAttribute("description-0").contains("0 m");
    selectByDataCyAttribute("description-0").contains("A new description.");
    selectByDataCyAttribute("description-0").contains("Quality of the description: very good");
    selectByDataCyAttribute("description-0").contains("50 m");

    // add lithological description that stretches two layers
    selectByDataCyAttribute("add-litho-desc-icon").click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-1"] [data-testid="ModeEditIcon"] ').click();

    // fill to depth dropdown
    selectByDataCyAttribute("to-depth-select").find('[role="combobox"]').click({ force: true });

    cy.get('.MuiPaper-elevation [role="listbox"]').find('[role="option"]').eq(1).click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-1"] [data-testid="ClearIcon"]').click();

    selectByDataCyAttribute("description-1").should("have.css", "height", "280px");
    // delete last layer
    cy.get('[data-cy="description-1"] [data-testid="DeleteIcon"] ').click();

    deleteItem("description-button-box");
    cy.wait("@lithological_description"); // delete request
    cy.wait("@lithological_description"); // updated get request
    cy.wait(5000);

    // add two lithological descriptions
    selectByDataCyAttribute("add-litho-desc-icon").click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-1"] [data-testid="ModeEditIcon"] ').click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-1"] [data-testid="ClearIcon"]').click();
    cy.wait("@lithological_description");
    cy.wait(2000);

    selectByDataCyAttribute("add-litho-desc-icon").click();
    cy.wait("@lithological_description");
    cy.get('[data-cy="description-2"] [data-testid="ModeEditIcon"] ').click();
    cy.wait("@lithological_description");

    // stop editing
    cy.get('[data-cy="description-2"] [data-testid="ClearIcon"]').click();
    cy.wait("@lithological_description");
    cy.wait(2000);

    // delete the one in the middle
    cy.get('[data-cy="description-1"] [data-testid="DeleteIcon"] ').click();

    // assert error message
    selectByDataCyAttribute("description-1").contains(
      "You are about to delete this layer, how do you want to proceed?",
    );
    deleteItem("description-button-box");
    cy.wait("@lithological_description"); // delete request
    cy.wait("@lithological_description"); // updated get request
    selectByDataCyAttribute("description-1").contains("There is an undefined interval in the sequence");
    // refill the middle
    cy.get('[data-cy="description-1"] [data-testid="AddCircleIcon"] ').click();

    // assert no error message
    selectByDataCyAttribute("description-1").contains("Quality of the description: -");

    // stop editing
    stopBoreholeEditing();
    returnToOverview();
  });
});
