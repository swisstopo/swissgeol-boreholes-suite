export const getInputFieldBackgroundColor = errorFieldName =>
  Boolean(errorFieldName) ? "#fff6f6" : "transparent";

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay, FormDisplayType } from "./formDisplay";
