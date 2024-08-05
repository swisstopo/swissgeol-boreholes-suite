import { TextField } from "@mui/material";
import { theme } from "../../AppTheme";
import { forwardRef } from "react";

export const getFormFieldError = (fieldName, errors) => {
  if (typeof fieldName !== "string") {
    return undefined;
  }

  const fieldNameElements = fieldName ? fieldName.split(".") : [];
  var currentElement = errors;
  for (var i = 0; i < fieldNameElements.length; i++) {
    currentElement = currentElement[fieldNameElements[i]];
    if (!currentElement) {
      break;
    }
  }
  return currentElement ? theme.palette.error.background : undefined;
};

export const FormField = forwardRef((props, ref) => {
  return <TextField ref={ref} {...props} size="small" variant="filled" />;
});

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay } from "./formDisplay";
export { FormDisplayType } from "./formDisplayType";
