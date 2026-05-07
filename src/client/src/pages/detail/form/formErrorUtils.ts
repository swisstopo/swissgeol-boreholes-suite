import { FieldErrors } from "react-hook-form";

const findFirstErrorRef = (errors: object): HTMLElement | undefined => {
  for (const value of Object.values(errors)) {
    if (!value || typeof value !== "object") continue;
    if ("ref" in value && value.ref instanceof HTMLElement) return value.ref;
    const nested = findFirstErrorRef(value);
    if (nested) return nested;
  }
};

export const scrollToFirstError = (errors: FieldErrors) => {
  const ref = findFirstErrorRef(errors);
  ref?.scrollIntoView({ behavior: "smooth", block: "center" });
  ref?.focus({ preventScroll: true });
};
