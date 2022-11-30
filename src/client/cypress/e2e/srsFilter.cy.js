import { interceptApiCalls, newEditableBorehole, login } from "./testHelpers";

describe("Tests for filtering data by reference system.", () => {
  beforeEach(() => {
    interceptApiCalls();
  });

  function goToEditorLocationFilter() {
    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Editor").click();
    cy.contains("div", "Location filters").click();
  }

  function goToViewerLocationFilter() {
    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Settings").click();
    cy.contains("h3", "Viewer").click();
    cy.contains("div", "Location filters").click();
  }

  it("can set filters as viewer", () => {
    login();
    goToViewerLocationFilter();

    cy.contains("div", "Spatial reference system")
      .children()
      .first()
      .children()
      .first()
      .as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Viewer").click();
    cy.contains("span", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    goToViewerLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Viewer").click();
    cy.contains("span", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("not.exist");
  });

  it("can set filters as editor", () => {
    login("/editor");
    goToEditorLocationFilter();

    cy.contains("div", "Spatial reference system")
      .children()
      .first()
      .children()
      .first()
      .as("checkbox");
    cy.get("@checkbox").check({ force: true });
    cy.get("@checkbox").should("be.checked");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Editor").click();
    cy.contains("span", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    goToEditorLocationFilter();
    cy.get("@checkbox").uncheck({ force: true });
    cy.get("@checkbox").should("not.be.checked");

    cy.get("i[class='th big icon']").click();
    cy.contains("h4", "Editor").click();
    cy.contains("span", "Location").click();
    cy.get('[data-cy="spatial-reference-filter"]').should("not.exist");
  });

  it("can filter by reference system", () => {
    login("/editor");
    newEditableBorehole().as("borehole_id");
    cy.get('[data-cy="LV03X"]').children().first().as("LV03X-input");
    cy.get('[data-cy="LV03Y"]').children().first().as("LV03Y-input");

    cy.get("input[value=20104002]").click();

    cy.get("@LV03X-input").type("645778", { delay: 10 });
    cy.get("@LV03Y-input").type("245794", { delay: 10 });

    cy.wait(["@edit_patch", "@edit_patch", "@edit_patch", "@edit_patch"]);

    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    cy.contains("span", "Location").click();
    cy.get('[class="ui fitted toggle checkbox"]')
      .children()
      .first()
      .check({ force: true });
    cy.get('[data-cy="radiobutton-all"]').click();
    cy.get("tbody").children().should("have.length", 22);

    cy.get('[data-cy="spatial-reference-filter"]').should("exist");

    cy.get('[data-cy="radiobutton-LV95"]').click();
    cy.get("tbody").children().should("have.length", 21);

    cy.get('[data-cy="radiobutton-LV03"]').click();
    cy.get("tbody").children().should("have.length", 1);
    cy.get("@borehole_id").then(id => deleteBorehole(id));
  });
});
