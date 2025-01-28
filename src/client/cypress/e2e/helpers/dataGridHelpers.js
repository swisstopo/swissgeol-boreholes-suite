export const verifyPaginationText = text => {
  cy.get(".MuiTablePagination-displayedRows").should("have.text", text);
};

export const sortBy = headerTextContent => {
  cy.get(".MuiDataGrid-columnHeader").contains(headerTextContent).click();
  waitForTableData();
};

export const verifyRowContains = (rowContent, rowIndex) => {
  cy.get(".MuiDataGrid-row")
    .eq(rowIndex)
    .within(() => {
      cy.contains(rowContent).should("exist");
    });
};

export const waitForTableData = () => {
  cy.wait("@edit_list");
  cy.get(".MuiDataGrid-root").should("be.visible");
  cy.get(".loading-indicator").should("not.exist");
  cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
};

export const showTableAndWaitForData = () => {
  cy.get('[data-cy="showTableButton"]').click();
  waitForTableData();
};

export const checkAllVisibleRows = () => {
  cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").find('input[type="checkbox"]').check({ force: true });
};

export const checkRowWithText = text => {
  cy.contains(".MuiDataGrid-row", text).find('.MuiCheckbox-root input[type="checkbox"]').check({ force: true });
};

export const unCheckRowWithText = text => {
  cy.contains(".MuiDataGrid-row", text).find('.MuiCheckbox-root input[type="checkbox"]').uncheck({ force: true });
};

export const checkTwoFirstRows = () => {
  cy.get(".MuiDataGrid-row").eq(0).find('.MuiCheckbox-root input[type="checkbox"]').check({ force: true });
  cy.get(".MuiDataGrid-row").eq(1).find('.MuiCheckbox-root input[type="checkbox"]').check({ force: true });
};

export const clickOnRowWithText = text => {
  cy.contains(".MuiDataGrid-row", text).click();
};
