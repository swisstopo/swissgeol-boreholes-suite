import { useParams } from "react-router";

/**
 * useRequiredParams - safely read URL parameters, throw if missing.
 * Parses all values to integers since every route param in this app is a numeric ID.
 */
export function useRequiredParams<T extends Record<string, string>>(): { [K in keyof T]: number } {
  const params = useParams() as Partial<T>;
  const result = {} as { [K in keyof T]: number };

  for (const key in params) {
    const value = params[key];
    if (value === undefined) {
      throw new Error(`Missing URL parameter: ${key}`);
    }
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed)) {
      throw new Error(`URL parameter '${key}' is not a valid integer: ${value}`);
    }
    (result as Record<string, number>)[key] = parsed;
  }

  return result;
}
