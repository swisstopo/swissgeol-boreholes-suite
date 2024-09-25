import { Merge } from "react-hook-form";
import { FieldError, FieldErrorsImpl } from "react-hook-form/dist/types/errors";

export const getFormFieldError = (
  fieldName: string | undefined,
  errors: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined,
) => {
  if (!fieldName || !errors) {
    return false;
  }

  const fieldNameElements = fieldName ? fieldName.split(".") : [];
  let currentElement = errors;
  for (let i = 0; i < fieldNameElements.length; i++) {
    // @ts-expect-error - we know that currentElement either has a key of fieldNameElements[i] or it doesn't,
    // which is what we're checking for
    currentElement = currentElement[fieldNameElements[i]];
    if (!currentElement) {
      break;
    }
  }
  return !!currentElement;
};

export enum FormValueType {
  Text = "text",
  Number = "number",
  Date = "date",
  DateTime = "datetime-local",
  Boolean = "boolean",
  Domain = "domain",
  Workgroup = "workgroup",
}

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormDomainSelect } from "./formDomainSelect";
export { FormDomainMultiSelect } from "./formDomainMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay } from "./formDisplay";
export { FormCoordinate } from "./formCoordinate";
export { FormContainer } from "./formContainer";
