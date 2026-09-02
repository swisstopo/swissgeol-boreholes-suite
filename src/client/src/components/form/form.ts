import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export const getFormFieldError = (
  fieldName: string | undefined,
  errors: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined,
): FieldError | undefined => {
  if (!fieldName || !errors) {
    return undefined;
  }

  const fieldNameElements = fieldName ? fieldName.split(".") : [];
  let currentElement = errors;
  for (const element of fieldNameElements) {
    // @ts-expect-error - we know that currentElement either has a key of fieldNameElements[i] or it doesn't,
    // which is what we're checking for
    currentElement = currentElement[element];
    if (!currentElement) {
      break;
    }
  }

  return currentElement as FieldError;
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

export type FormError = { type: string; message: string };
export type FormErrors = { [key: string]: FormError | FormErrors };

export { FormInput } from "./formInput";
export { FormSelect } from "./formSelect";
export { FormMultiSelect } from "./formMultiSelect";
export { FormDomainSelect } from "./formDomainSelect";
export { FormDomainMultiSelect } from "./formDomainMultiSelect";
export { FormCheckbox } from "./formCheckbox";
export { FormDisplay } from "./formDisplay";
export { FormCoordinate } from "./formCoordinate";
export { FormContainer } from "./formContainer";
export { FormBooleanSelect } from "./formBooleanSelect";
export { FormInputDisplayOnly } from "./formInputDisplayOnly";
export { FormDialog } from "./formDialog";
