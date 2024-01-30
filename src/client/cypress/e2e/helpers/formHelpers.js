/**
 * Sets the value for an input form element.
 * @param {string} fieldName The name of the input field.
 * @param {string} text The text to type into the input field.
 * @param {boolean} clear Whether to clear the input field before typing
 */
export const setInput = (fieldName, value) => {
  var selector = `[data-cy="${fieldName}-formInput"]`;
  cy.get(selector)
    .click()
    .then(() => {
      cy.focused().clear();
      cy.get(selector).type(value, {
        delay: 10,
      });
    });
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number} index The index of the option to select.
 */
export const setSelect = (fieldName, index) => {
  var selector = `[data-cy="${fieldName}-formSelect"]`;
  cy.get(selector).find('[role="combobox"]').click();
  cy.get('.MuiPaper-elevation [role="listbox"]')
    .find('[role="option"]')
    .eq(index)
    .click();
};

/**
 * Toggles the checkbox for a checkbox form element.
 * @param {string} fieldName The name of the checkbox field.
 */
export const toggleCheckbox = fieldName => {
  var selector = `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).click();
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {number} expectedChecked The expected state of the checkbox.
 */
export const evaluateCheckbox = (fieldName, expectedChecked) => {
  var checked = expectedChecked ? "true" : "false";
  var selector = `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).invoke("attr", "aria-disabled").should("eq", checked);
};

export const evaluateDisplayValue = (fieldName, expectedValue) => {
  cy.get(`[data-cy="${fieldName}-formDisplay"]`).contains(expectedValue);
};
