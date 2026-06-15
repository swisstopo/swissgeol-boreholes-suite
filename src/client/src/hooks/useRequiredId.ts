import { useTranslation } from "react-i18next";
import { useParams } from "react-router";
import { InvalidRouteParamError } from "../api/errorClasses.ts";

const MAX_INT32 = 2_147_483_647;

/**
 * Reads the `:id` URL parameter, parses it to an integer, and validates
 * that it falls within the Int32 range used by the backend.
 * Throws {@link InvalidRouteParamError} when the value is missing or invalid.
 */
export function useRequiredId(): number {
  const { id } = useParams();
  const { t } = useTranslation();

  if (id === undefined) {
    throw new InvalidRouteParamError("Missing URL parameter: id", t("pageNotFound"));
  }
  const parsed = Number.parseInt(id, 10);
  if (Number.isNaN(parsed) || parsed < 1 || parsed > MAX_INT32) {
    throw new InvalidRouteParamError(`URL parameter 'id' is not a valid integer: ${id}`, t("pageNotFound"));
  }
  return parsed;
}
