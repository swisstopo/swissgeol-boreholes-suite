import { createBaseSelector } from "./testHelpers";

/**
 * Checks if a form element has an error.
 * @param {string} fieldName The name of the form element.
 * @param {boolean} hasError The expected error state.
 * @param {string} parent  (optional) The parent of the form element.
 */
export const hasError = (fieldName: string, hasError = true, parent?: string) => {
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
export const isDisabled = (fieldName: string, isDisabled = true, parent?: string) => {
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
export const hasAiStyle = (fieldName: string, hasAiStyle = true, parent?: string) => {
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
export const clearInput = (fieldName: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"]`;
  cy.get(selector).click();
  cy.focused().clear();
};

/**
 * Sets the value for an input form element.
 * @param {string} fieldName The name of the input field.
 * @param {string | number} value The text to type into the input field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setInput = (fieldName: string, value: string | number, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"]`;
  cy.get(selector).click();
  cy.focused().clear();
  cy.get(selector).type(String(value), {
    delay: 10,
  });
};

export const formatWithThousandsSeparator = (value: number): string | number =>
  value > 999 ? value.toLocaleString("de-CH").replaceAll("\u2019", "'") : value;

/**
 * Evaluates the state of an input form element
 * @param {string} fieldName The name of the input field.
 * @param {string | number} expectedValue The expected value.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateInput = (fieldName: string, expectedValue: string | number, parent?: string) => {
  if (typeof expectedValue === "number") {
    expectedValue = formatWithThousandsSeparator(expectedValue);
  }
  const selector = `${createBaseSelector(parent)}[data-cy="${fieldName}-formInput"] input`;
  cy.get(selector).should("have.value", expectedValue);
};

/**
 * Evaluates the state of a textarea form element
 * @param {string} fieldName The name of the input field.
 * @param {string} expectedValue The expected value.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateTextarea = (fieldName: string, expectedValue: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formInput"] textarea`;
  cy.get(selector)
    .filter((_k: number, input: HTMLTextAreaElement) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Scrolls the element into view.
 * @param {string} selector The selector for the form element.
 */
export const scrollIntoView = (selector: string) => {
  cy.get(selector).scrollIntoView();
};

/**
 * Opens the dropdown for a select or multi-select form element.
 * @param {string} selector The selector for the form element.
 */
export const openDropdown = (selector: string) => {
  cy.get(selector).find('[role="combobox"]').click();
};

/**
 * Selects an option from a dropdown.
 * @param {number} index The index of the option to select.
 */
export const selectDropdownOption = (index: number) => {
  cy.get('.MuiPaper-elevation [role="listbox"]').find("li").eq(index).scrollIntoView();
  cy.get('.MuiPaper-elevation [role="listbox"]').find("li").eq(index).click();
};

/**
 * Evaluates the number of options in a dropdown.
 * @param {number} length The expected number of options in the dropdown.
 */
export const evaluateDropdownOptionsLength = (length: number) => {
  cy.get('.MuiPaper-elevation [role="listbox"]').should($listbox => {
    expect($listbox.find('[role="option"]')).to.have.length(length);
  });
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number} index The index of the option to select.
 * @param {number} optionsLength The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setSelect = (fieldName: string, index: number, optionsLength?: number, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"]`;
  scrollIntoView(selector);
  openDropdown(selector);
  if (optionsLength) {
    evaluateDropdownOptionsLength(optionsLength);
  }
  selectDropdownOption(index);
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {string?} option The option to select ("Yes", "No", "Not specified")
 * @param {number} optionsLength The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const setYesNoSelect = (fieldName: string, option: string, optionsLength?: number, parent?: string) => {
  const listIndex = option.toLowerCase() === "yes" ? 0 : option.toLowerCase() === "no" ? 1 : 2; // order of options in dropdown list is Yes, No, Not Specified
  setSelect(fieldName, listIndex, optionsLength, parent);
};

/**
 * Evaluates the state of a select form element with the options "Yes", "No", "Not specified".
 * @param {string} fieldName The name of the select field.
 * @param {string?} expectedValue The expected value of the select ("Yes", "No", "Not specified")
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateYesNoSelect = (fieldName: string, expectedValue: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"] input`;
  cy.get(selector).should("have.value", expectedValue, `Expected ${fieldName} to have value ${expectedValue}`);
};

/**
 * Evaluates the state of a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {string | number} expectedText The text that should be displayed in the select.
 * @param {string} parent (optional) The parent of the form element.
 * @param {boolean} editable (optional) Defines whether the select is being evaluated in the editable or uneditable state.
 */
export const evaluateSelect = (fieldName: string, expectedText: string | number, parent?: string, editable = true) => {
  if (editable) {
    const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formSelect"] input`;
    cy.get(selector).should("have.value", expectedText, `Expected ${fieldName} to have value ${expectedText}`);
  } else if (!expectedText) {
    cy.dataCy(`${fieldName}-formSelect`).find(".MuiOutlinedInput-input").should("be.empty");
  } else {
    cy.dataCy(`${fieldName}-formSelect`).find(".MuiOutlinedInput-input").should("have.value", expectedText);
  }
};

/**
 * Sets the value for a multi-select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number[]} indices The indices of the options to select.
 * @param {number} optionsLength The expected number of options in the dropdown.
 * @param {string} parent (optional) The parent of the form element.
 */
export const toggleMultiSelect = (fieldName: string, indices: number[], optionsLength?: number, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"]`;
  indices.forEach(index => {
    openDropdown(selector);
    if (optionsLength) {
      evaluateDropdownOptionsLength(optionsLength);
    }
    selectDropdownOption(index);
  });
};

/**
 * Evaluates the state of a multi-select form element.
 * @param {string} fieldName The name of the multi-select field.
 * @param {string[]} expectedValues The expected values of the multi-select.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateMultiSelect = (fieldName: string, expectedValues: string[], parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formMultiSelect"] input`;
  cy.get(selector)
    .parent()
    .within(() => {
      if (expectedValues.length === 0) {
        cy.get('[data-cy^="chip-"]').should("not.exist");
      } else {
        expectedValues.forEach(v => {
          cy.dataCy(`chip-${v}`).scrollIntoView();
          cy.dataCy(`chip-${v}`).should("be.visible");
        });
      }
    });
};

/**
 * Toggles the checkbox for a checkbox form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {string} parent (optional) The parent of the form element.
 */
export const toggleCheckbox = (fieldName: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"]`;
  cy.get(selector).click();
};

/**
 * Evaluates the state of a checkbox form element.s
 * @param {string} fieldName The name of the checkbox field.
 * @param {boolean} expectedChecked The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateCheckbox = (fieldName: string, expectedChecked: boolean, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCheckbox"] input`;
  if (expectedChecked) {
    cy.get(selector).should("be.checked");
  } else {
    cy.get(selector).should("not.be.checked");
  }
};

/**
 * Evaluates the display value of a form element.
 * @param {string} fieldName The name of the checkbox field.
 * @param {string | string[]} expectedValue The expected state of the checkbox.
 * @param {string} parent (optional) The parent of the form element.
 */
export const evaluateDisplayValue = (fieldName: string, expectedValue: string | string[], parent?: string) => {
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
export const setCoordinate = (fieldName: string, value: string, parent?: string) => {
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
export const evaluateCoordinate = (fieldName: string, expectedValue: string, parent?: string) => {
  const selector = createBaseSelector(parent) + `[data-cy="${fieldName}-formCoordinate"] input`;
  cy.get(selector)
    .filter((_k: number, input: HTMLInputElement) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Sets the value for the original name field with a delay, so that the name field is updated correctly.
 * @param value The value to type in the input field.
 */
export const setOriginalName = (value: string) => {
  const originalNameInput = () => cy.contains("label", "Original name").next().children("input");
  originalNameInput().clear().type(value, { delay: 100 });
};
