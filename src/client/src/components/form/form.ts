import { FieldError, FieldErrorsImpl, Merge } from "react-hook-form";

export const getFormFieldError = (
  fieldName: string | undefined,
  errors: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined,
): FieldError | undefined => {
  if (!fieldName || !errors) {
    return undefined;
  }

  const fieldNameElements = fieldName ? fieldName.split(".") : [];
  // The error tree is keyed by the field path, and a segment of that path may not be present at
  // all, so each step is read as an unknown value rather than as a declared property.
  let currentElement: unknown = errors;
  for (const element of fieldNameElements) {
    currentElement = (currentElement as Record<string, unknown>)[element];
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
