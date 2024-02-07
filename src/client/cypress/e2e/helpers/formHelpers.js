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
export const evaluateInput = (fieldName, expectedValue) => {
  var selector = `[data-cy="${fieldName}-formInput"] input`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};
export const evaluateTextarea = (fieldName, expectedValue) => {
  var selector = `[data-cy="${fieldName}-formInput"] textarea`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

export const openDropdown = selector => {
  cy.get(selector).find('[role="combobox"]').click();
};

export const selectDropdownOption = index => {
  cy.get('.MuiPaper-elevation [role="listbox"]')
    .find('[role="option"]')
    .eq(index)
    .click();
};

export const evaluateDropdownOptionsLength = length => {
  cy.get('.MuiPaper-elevation [role="listbox"]').should($listbox => {
    expect($listbox.find('[role="option"]')).to.have.length(length);
  });
};

export const closeDropdown = () => {
  cy.get("body").click();
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number} index The index of the option to select.
 */
export const setSelect = (fieldName, index, expected) => {
  var selector = `[data-cy="${fieldName}-formSelect"]`;
  openDropdown(selector);
  if (expected != null) {
    // cy.wait("@codelist_GET");
    evaluateDropdownOptionsLength(expected);
  }
  selectDropdownOption(index);
};

export const evaluateSelect = (fieldName, expectedValue) => {
  var selector = `[data-cy="${fieldName}-formSelect"] input`;
  cy.get(selector)
    .filter((k, input) => {
      return input.value === expectedValue;
    })
    .should("have.length", 1);
};

/**
 * Sets the value for a select form element.
 * @param {string} fieldName The name of the select field.
 * @param {number[]} indices The indices of the options to select.
 * @param {number} expected The expected number of options in the dropdown.
 */
export const toggleMultiSelect = (fieldName, indices, expected) => {
  var selector = `[data-cy="${fieldName}-formMultiSelect"]`;
  openDropdown(selector);
  if (expected != null) {
    // cy.wait("@codelist_GET");
    evaluateDropdownOptionsLength(expected);
  }
  indices.forEach(index => {
    selectDropdownOption(index);
  });
  closeDropdown();
};

export const evaluateMultiSelect = (fieldName, expectedValues) => {
  var selector = `[data-cy="${fieldName}-formMultiSelect"] input`;
  cy.get(selector)
    .filter((k, input) => {
      if (expectedValues.length === 0) {
        return input.value === "";
      } else {
        var values = input.value.split(",");
        return (
          values.length === expectedValues.length &&
          values.every(v => expectedValues.includes(v))
        );
      }
    })
    .should("have.length", 1);
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
  if (Array.isArray(expectedValue)) {
    expectedValue.forEach(value => {
      cy.get(`[data-cy="${fieldName}-formDisplay"]`).contains(value);
    });
  } else {
    cy.get(`[data-cy="${fieldName}-formDisplay"]`).contains(expectedValue);
  }
};
