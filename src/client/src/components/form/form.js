import { theme } from "../../AppTheme";

export const getFormFieldError = (fieldName, errors) => {
  if (typeof fieldName !== "string") {
    return undefined;
  }

  const fieldNameElements = fieldName ? fieldName.split(".") : [];
  let currentElement = errors;
  for (let i = 0; i < fieldNameElements.length; i++) {
    currentElement = currentElement[fieldNameElements[i]];
    if (!currentElement) {
      break;
    }
  }
  return currentElement ? theme.palette.error.background : undefined;
};

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay } from "./formDisplay";
export { FormDisplayType } from "./formDisplayType";
