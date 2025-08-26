import { useParams } from "react-router";

/**
 * useRequiredParams - safely read URL parameters, throw if missing
 */
export function useRequiredParams<T extends Record<string, string>>() {
  const params = useParams() as Partial<T>;

  for (const key in params) {
    if (params[key] === undefined) {
      throw new Error(`Missing URL parameter: ${key}`);
    }
  }

  return params as { [K in keyof T]: string };
}
