export const saveForm = () => {
  cy.get('[data-cy="save-button"]').click({ force: true });
};

export const startEditing = () => {
  cy.get('[data-cy="edit-button"]').click({ force: true });
};

export const cancelEditing = () => {
  cy.get('[data-cy="cancel-button"]').click({ force: true });
};

export const deleteItem = () => {
  cy.get('[data-cy="delete-button"]').click({ force: true });
};

export const copyItem = () => {
  cy.get('[data-cy="copy-button"]').click({ force: true });
};

export const addItem = itemLabel => {
  cy.get(`[data-cy="${itemLabel}-button"]`).click({ force: true });
};
