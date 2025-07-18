import { createBaseSelector } from "./testHelpers";

/**
 * Checks if a form element has an error.
 * @param {string} fieldName The name of the form element.
 * @param {boolean} hasError The expected error state.
 * @param {string} parent  (optional) The parent of the form element.
 */
export const hasError = (fieldName, hasError = true, parent = "") => {
  const selector = createBaseSelector(parent) + `[data-cy^="${fieldName}-form"] .Mui-error`;
  if (hasError) {
    cy.get(selector).should("exist");
  } else {
    cy.get(selector).should("not.exist");
  }
};

/**
 * Checks if a form element is disabled.
 * @param {string} fieldName The name of the form element.
 * @param {boolean} isDisabled The expected disabled state.
 * @param {string} parent  (optional) The parent of the form element.
 */
export const isDisabled = (fieldName, isDisabled = true, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy^="${fieldName}-form"] .Mui-disabled`;
  if (isDisabled) {
    cy.get(selector).should("exist");
  } else {
    cy.get(selector).should("not.exist");
  }
};

/**
 * Checks if a form element has the AI styling.
 * @param {string} fieldName The name of the form element.
 * @param {boolean} hasAiStyle The expected AI state.
 * @param {string} parent  (optional) The parent of the form element.
 */
export const hasAiStyle = (fieldName, hasAiStyle = true, parent = "") => {
  const selector = createBaseSelector(parent) + `[data-cy^="${fieldName}-form"].ai`;
  if (hasAiStyle) {
    cy.get(selector).should("exist");
  } else {
    cy.get(selector).should("not.exist");
  }
};

/**
 * Clears the value of an input form element.
 * @param {string} fieldName The name of the input field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const clearInput = (fieldName, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"]`;
  cy.get(selector).click();
  cy.focused().clear();
};

/**
 * Sets the value for an input form element.
 * @param {string} fieldName The name of the input field.
 * @param {string} value The text to type into the input field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setInput = (fieldName, value, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"]`;
  cy.get(selector).click();
  cy.focused().clear();
  cy.get(selector).type(value, {
    delay: 10,
  });
};

/**
 * Evaluates the state of an input form element
 * @param {string} fieldName The name of the input field.
 * @param {number} expectedValue The expected value.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateInput = (fieldName, expectedValue, parent) => {
  const selector = `${createBaseSelector(parent)}[data-cy="${fieldName}-formInput"] input`;
  cy.get(selector).should("have.value", expectedValue);
};

/**
 * Evaluates the state of a textarea form element
 * @param {string} fieldName The name of the input field.
 * @param {string} expectedValue The expected value.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateTextarea = (fieldName, expectedValue, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"] textarea`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Scrolls the element into view.
 * @param {string} selector The selector for the form element.
 */
export const scrollIntoView = selector => {
  cy.get(selector).scrollIntoView();
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
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"]`;
  scrollIntoView(selector);
  openDropdown(selector);
  if (expected != null) {
    evaluateDropdownOptionsLength(expected);
  }
  selectDropdownOption(index);
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {string?} option The option to select ("Yes", "No", "Not specified")
 * @param {number} expected The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setYesNoSelect = (fieldName, option, expected, parent) => {
  const listIndex = option.toLowerCase() === "yes" ? 0 : option.toLowerCase() === "no" ? 1 : 2; //order of options in dropdown list is Yes, No, Not Specified
  setSelect(fieldName, listIndex, expected, parent);
};

/**
 * Evaluates the state of a select form element with the options "Yes", "No", "Not specified".
 * @param {string} fieldName The name of the select field.
 * @param {string?} expectedValue The expected value of the select ("Yes", "No", "Not specified")
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateYesNoSelect = (fieldName, expectedValue, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"] input`;
  cy.get(selector).should("have.value", expectedValue, `Expected ${fieldName} to have value ${expectedValue}`);
};

/**
 * Evaluates the state of a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {string} expectedText The text that should be displayed in the select.
 * @param {string} parent (optional) The parent of the form element.
 * @param {boolean} editable (optional) Defines whether the select is being evaluated in the editable or uneditable state.
 */
export const evaluateSelect = (fieldName, expectedText, parent = null, editable = true) => {
  if (editable) {
    const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"] input`;
    cy.get(selector).should("have.value", expectedText, `Expected ${fieldName} to have value ${expectedText}`);
  } else if (!expectedText) {
    cy.get(`[data-cy="${fieldName}-formSelect"]`).find(".MuiOutlinedInput-input").should("be.empty");
  } else {
    cy.get(`[data-cy="${fieldName}-formSelect"]`).find(".MuiOutlinedInput-input").should("have.value", expectedText);
  }
};

/**
 * Evaluates the state of a MUI Textfield of type select.
 * @param {string} fieldName The name of the select field.
 * @param {string / null} expectedText The text that should be displayed in the select.
 */
export const evaluateSelectTextfield = (fieldName, expectedText) => {
  if (expectedText === null) {
    cy.get(`[data-cy="${fieldName}-formSelect"]`).find(".MuiSelect-nativeInput").should("be.empty");
  } else {
    cy.get(`[data-cy="${fieldName}-formSelect"]`).find(".MuiSelect-select").should("have.text", expectedText);
  }
};

/**
 * Sets the value for a multi-select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number[]} indices The indices of the options to select.
 * @param {number} expected The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const toggleMultiSelect = (fieldName, indices, expected, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"]`;
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
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"] input`;
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
export const toggleCheckbox = (fieldName, parent = "") => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).click();
};

/**
 * Evaluates the state of a checkbox form element.s
 * @param {string} fieldName The name of the checkbox field.
 * @param {number} expectedChecked The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateCheckbox = (fieldName, expectedChecked, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).invoke("attr", "aria-disabled").should("eq", expectedChecked);
};

/**
 * Evaluates the display value of a form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {number} expectedValue The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateDisplayValue = (fieldName, expectedValue, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formDisplay"]`;
  if (Array.isArray(expectedValue)) {
    expectedValue.forEach(value => {
      cy.get(selector).contains(value);
    });
  } else {
    cy.get(selector).contains(expectedValue);
  }
};

/**
 * Sets the value for a coordinate form element.
 * @param {string} fieldName The name of the coordinate field.
 * @param {string} value The text to type into the coordinate field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setCoordinate = (fieldName, value, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCoordinate"]`;
  cy.get(selector).click();
  cy.focused().clear();
  cy.get(selector).type(value, {
    delay: 10,
  });
};

/**
 * Evaluates the state of a coordinate form element
 * @param {string} fieldName The name of the coordinate field.
 * @param {number} expectedValue The expected value.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateCoordinate = (fieldName, expectedValue, parent) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCoordinate"] input`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Sets the value for the original name field with a delay, so that the name field is updated correctly.
 * @param value The value to type in the input field.
 */
export const setOriginalName = value => {
  const originalNameInput = () => cy.contains("label", "Original name").next().children("input");
  originalNameInput().clear().type(value, { delay: 100 });
};
