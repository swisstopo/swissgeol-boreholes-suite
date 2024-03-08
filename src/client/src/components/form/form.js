import { TextField } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../../AppTheme.js";

export const getFormFieldBackgroundColor = (fieldName, errors) => {
  if (typeof fieldName === "string") {
    var fieldNameElements = fieldName ? fieldName.split(".") : [];
    var currentElement = errors;
    for (var i = 0; i < fieldNameElements.length; i++) {
      currentElement = currentElement[fieldNameElements[i]];
      if (!currentElement) {
        break;
      }
    }
    return currentElement ? theme.palette.error.background : "transparent";
  } else {
    return "transparent";
  }
};

export const FormField = styled(TextField)(() => ({
  borderRadius: "4px",
  flex: "1",
  marginTop: "10px !important",
  marginRight: "10px !important",
  "& .MuiInputBase-input": {
    minHeight: "26px !important",
  },
}));

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay } from "./formDisplay";
export { FormDisplayType } from "./formDisplayType";
