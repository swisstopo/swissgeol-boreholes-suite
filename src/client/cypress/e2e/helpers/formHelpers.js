import { createBaseSelector } from "./testHelpers";

/**
 * Sets the value for an input form element.
 * @param {string} fieldName The name of the input field.
 * @param {string} text The text to type into the input field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setInput = (fieldName, value, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"]`;
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
 * Evaluates the state of an input form element
 * @param {string} fieldName The name of the select field.
 * @param {number} expectedValue The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateInput = (fieldName, expectedValue, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"] input`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Evaluates the state of a textarea form element
 * @param {string} fieldName The name of the select field.
 * @param {number} expectedValue The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateTextarea = (fieldName, expectedValue, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"] textarea`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Opens the dropdown for a select or multi-select form element.
 * @param {string} selector The selector for the form element.
 */
export const openDropdown = selector => {
  cy.get(selector).find('[role="combobox"]').click();
};

/**
 * Selects an option from a dropdown.
 * @param {number} index The index of the option to select.
 */
export const selectDropdownOption = index => {
  cy.get('.MuiPaper-elevation [role="listbox"]').find("li").eq(index).click();
};

/**
 * Evaluates the number of options in a dropdown.
 * @param {number} length The expected number of options in the dropdown.
 */
export const evaluateDropdownOptionsLength = length => {
  cy.get('.MuiPaper-elevation [role="listbox"]').should($listbox => {
    expect($listbox.find('[role="option"]')).to.have.length(length);
  });
};

/**
 * Closes the dropdown for a select or multi-select form element.
 */
export const closeDropdown = () => {
  cy.get("body").click();
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number} index The index of the option to select.
 * @param {number} expected The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setSelect = (fieldName, index, expected, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"]`;
  openDropdown(selector);
  if (expected != null) {
    evaluateDropdownOptionsLength(expected);
  }
  selectDropdownOption(index);
};

/**
 * Evaluates the state of a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {string} expectedValue The expected value of the select.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateSelect = (fieldName, expectedValue, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"] input`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Sets the value for a multi-select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number[]} indices The indices of the options to select.
 * @param {number} expected The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const toggleMultiSelect = (fieldName, indices, expected, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"]`;
  openDropdown(selector);
  if (expected != null) {
    evaluateDropdownOptionsLength(expected);
  }
  indices.forEach(index => {
    selectDropdownOption(index);
  });
  closeDropdown();
};

/**
 * Evaluates the state of a multi-select form element.
 * @param {string} fieldName The name of the multi-select field.
 * @param {string[]} expectedValues The expected values of the multi-select.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateMultiSelect = (fieldName, expectedValues, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"] input`;
  cy.get(selector)
    .filter((k, input) => {
      if (expectedValues.length === 0) {
        return input.value === "";
      } else {
        var values = input.value.split(",");
        return values.length === expectedValues.length && values.every(v => expectedValues.includes(v));
      }
    })
    .should("have.length", 1);
};

/**
 * Toggles the checkbox for a checkbox form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const toggleCheckbox = (fieldName, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).click();
};

/**
 * Evaluates the state of a checkbox form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {number} expectedChecked The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateCheckbox = (fieldName, expectedChecked, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).invoke("attr", "aria-disabled").should("eq", expectedChecked);
};

/**
 * Evaluates the display value of a form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {number} expectedChecked The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateDisplayValue = (fieldName, expectedValue, parent) => {
  var selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formDisplay"]`;
  if (Array.isArray(expectedValue)) {
    expectedValue.forEach(value => {
      cy.get(selector).contains(value);
    });
  } else {
    cy.get(selector).contains(expectedValue);
  }
};
