import {
  createBorehole,
  goToDetailRouteAndAcceptTerms,
  loginAsAdmin,
  loginAsEditor,
  startBoreholeEditing,
  stopBoreholeEditing,
} from "../helpers/testHelpers";

describe("Borehole locking tests", () => {
  it("Verifies locking behaviour for editor and admin", () => {
    createBorehole({ originalName: "FILLIFERRET" }).as("borehole_id");

    // start editing new borehole as admin
    cy.get("@borehole_id").then(id => {
      goToDetailRouteAndAcceptTerms(`/${id}`);
      startBoreholeEditing();

      // check that borehole is locked for editor
      loginAsEditor();
      goToDetailRouteAndAcceptTerms(`/${id}`);

      // check that edit buttons are not visible
      cy.dataCy("export-button").should("exist");
      cy.dataCy("edit-button").should("not.exist");
      cy.dataCy("editingstop-button").should("not.exist");

      // start editing existing borehole as editor
      goToDetailRouteAndAcceptTerms(`/1000488`);
      startBoreholeEditing();

      // check that admin can edit, even if borehole is locked
      loginAsAdmin();
      goToDetailRouteAndAcceptTerms(`/1000488`);
      startBoreholeEditing();
      stopBoreholeEditing();
    });
  });
});
