import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { InvalidRouteParamError } from "../api/errorClasses.ts";

const MAX_INT32 = 2_147_483_647;

/**
 * useRequiredParams - safely read URL parameters, throw if missing.
 * Parses all values to integers since every route param in this app is a numeric ID.
 * Validates that values fall within the Int32 range used by the backend.
 */
export function useRequiredParams<T extends Record<string, string>>(): { [K in keyof T]: number } {
  const params = useParams() as Partial<T>;
  const { t } = useTranslation();
  const result = {} as { [K in keyof T]: number };

  for (const key in params) {
    if (key === "*") continue; // Skip react-router's catch-all wildcard
    const value = params[key];
    if (value === undefined) {
      throw new InvalidRouteParamError(`Missing URL parameter: ${key}`, t("pageNotFound"));
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1 || parsed > MAX_INT32) {
      throw new InvalidRouteParamError(`URL parameter '${key}' is not a valid integer: ${value}`, t("pageNotFound"));
    }
    (result as Record<string, number>)[key] = parsed;
  }

  return result;
}
