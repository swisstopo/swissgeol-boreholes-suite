export const verifyPaginationText = text => {
  cy.get(".MuiTablePagination-displayedRows").should("have.text", text);
};

export const hasPagination = exists => {
  if (exists) {
    cy.get(".MuiTablePagination-displayedRows").should("exist");
  } else {
    cy.get(".MuiTablePagination-displayedRows").should("not.exist");
  }
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

export const verifyRowWithContentAlsoContains = (rowContent, alsoContains) => {
  cy.get(".MuiDataGrid-row")
    .contains(rowContent)
    .parent()
    .within(() => {
      cy.contains(alsoContains).should("exist");
    });
};

export const clickOnNextPage = () => {
  cy.get('[aria-label="next page"]').scrollIntoView();
  cy.get('[aria-label="next page"]').click();
  waitForTableData();
};

export const clickOnLastPage = () => {
  cy.get('[aria-label="last page"]').scrollIntoView();
  cy.get('[aria-label="last page"]').click();
  waitForTableData();
};

export const verifyTableLength = length => {
  if (length === 0) {
    cy.get(".MuiDataGrid-row").should("not.exist");
  } else {
    cy.get(".MuiDataGrid-row").should("have.length", length);
  }
};

export const waitForTableData = () => {
  cy.get(".MuiDataGrid-root").should("be.visible");
  cy.get(".loading-indicator").should("not.exist");
  cy.get(".MuiCircularProgress-root").should("not.exist");
  cy.get(".MuiDataGrid-row").should("have.length.greaterThan", 0);
};

export const showTableAndWaitForData = () => {
  cy.get('[data-cy="showTableButton"]').click();
  waitForTableData();
};

export const checkAllVisibleRows = () => {
  cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").find('input[type="checkbox"]').check({ force: true });
};

export const uncheckAllVisibleRows = () => {
  cy.get(".MuiDataGrid-columnHeaderCheckbox .MuiCheckbox-root").find('input[type="checkbox"]').uncheck({ force: true });
};

const getCheckboxCellSelector = column =>
  column ? `[data-field="${column}"] .MuiCheckbox-root` : ".MuiDataGrid-cellCheckbox";

export const checkRowWithText = (text, column) => {
  cy.contains(".MuiDataGrid-row", text)
    .find(`${getCheckboxCellSelector(column)} input[type="checkbox"]`)
    .check({ force: true });
};

export const unCheckRowWithText = (text, column) => {
  cy.contains(".MuiDataGrid-row", text)
    .find(`${getCheckboxCellSelector(column)} input[type="checkbox"]`)
    .uncheck({ force: true });
};

export const verifyRowWithTextCheckState = (text, checked, column) => {
  cy.contains(".MuiDataGrid-row", text)
    .find(`${getCheckboxCellSelector(column)} input[type="checkbox"]`)
    .should(checked ? "be.checked" : "not.be.checked");
};

export const checkTwoFirstRows = () => {
  checkRowWithIndex(0);
  checkRowWithIndex(1);
};

export const checkRowWithIndex = index => {
  cy.get(".MuiDataGrid-row").eq(index).find('.MuiDataGrid-cellCheckbox input[type="checkbox"]').check({ force: true });
};

export const clickOnRowWithText = text => {
  cy.contains(".MuiDataGrid-row", text).click();
};

export const setTextInRow = (row, field, text) => {
  const rowSelector =
    typeof row === "number"
      ? cy.get(".MuiDataGrid-row").eq(row).find(`[data-cy="${field}"]`)
      : cy.contains(".MuiDataGrid-row", row).find(`[data-cy="${field}"]`);

  rowSelector.click();
  cy.focused().clear();
  rowSelector.type(text, { delay: 10 });
};
