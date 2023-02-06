import { newEditableBorehole } from "../testHelpers";

describe("Tests for 'Attachments' edit page.", () => {
  it("creates, downloads and deletes attachments.", () => {
    newEditableBorehole();

    // add some basic information
    cy.contains("label", "Original name")
      .next()
      .children("input")
      .type("JUNIORSOUFFLE");
    cy.wait("@edit_patch");

    // navigate to attachments tab
    cy.get('[data-cy="attachments-menu-item"]').click();

    // upload and verify file LOUDSPATULA.docx
    cy.get("input[type=file]").selectFile({
      contents: Cypress.Buffer.from(Math.random().toString()),
      fileName: "LOUDSPATULA.docx",
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    cy.get('[data-cy="attachments-upload-button"]')
      .should("be.visible")
      .click();
    cy.wait(["@files", "@edit_listfiles"]);
    cy.get("tbody").children().should("have.length", 1);
    cy.get("tbody")
      .children()
      .contains(
        "td",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      );
    cy.get("tbody").children().contains("span", "LOUDSPATULA.docx").click();
    cy.wait("@download-file");

    // upload and verify file IRATETRINITY.pdf
    cy.get("input[type=file]").selectFile({
      contents: Cypress.Buffer.from(Math.random().toString()),
      fileName: "IRATETRINITY.pdf",
      mimeType: "application/pdf",
    });
    cy.get('[data-cy="attachments-upload-button"]')
      .should("be.visible")
      .click();
    cy.wait(["@files", "@edit_listfiles"]);
    cy.get("tbody").children().should("have.length", 2);
    cy.get("tbody").children().contains("td", "application/pdf");
    cy.get("tbody").children().contains("span", "IRATETRINITY.pdf").click();
    cy.wait("@download-file");

    // delete attachments
    cy.get("tbody")
      .children()
      .first()
      .get("td button")
      .children()
      .first()
      .click();
    cy.wait(["@files", "@edit_listfiles"]);
    cy.get("tbody")
      .children()
      .first()
      .get("td button")
      .children()
      .first()
      .click();
    cy.wait(["@files", "@edit_listfiles"]);
    cy.get("tbody").children().should("have.length", 0);

    // stop editing
    cy.contains("a", "Stop editing").click();
    cy.wait("@edit_unlock");
    cy.contains("h3", "Done").click();
    cy.wait(["@edit_list", "@borehole"]);

    // reset test data
    cy.get('[data-cy="borehole-table"]').within(() => {
      cy.contains("JUNIORSOUFFLE").parent().find(".checkbox").click();
      cy.contains("button", "Delete").click();
    });
    cy.get(".modal button.negative").click();
    cy.wait(["@edit_deletelist", "@edit_list"]);
  });
});
