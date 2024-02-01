import { TextField } from "@mui/material";
import { styled } from "@mui/system";

export const getInputFieldBackgroundColor = errorFieldName =>
  Boolean(errorFieldName) ? "#fff6f6" : "transparent";

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
export { FormDisplay, FormDisplayType } from "./formDisplay";
