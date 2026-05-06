import { useEffect, useState } from "react";

/**
 * Feature-flag helper. Intentionally not consumed by default — features gated behind
 * `?dev=true` / `#dev=true` are released together with this hook and only wired up in
 * components once the corresponding feature is meant to become visible.
 *
 * @public — keep exported even when no consumer currently references it.
 */
export const useDevMode = () => {
  const [runsDevMode, setRunsDevMode] = useState(
    () => window.location.search.includes("dev=true") || window.location.hash.includes("dev=true"),
  );

  useEffect(() => {
    const checkDevMode = () => {
      setRunsDevMode(window.location.search.includes("dev=true") || window.location.hash.includes("dev=true"));
    };

    window.addEventListener("popstate", checkDevMode);
    window.addEventListener("pushstate", checkDevMode);

    return () => {
      window.removeEventListener("popstate", checkDevMode);
      window.removeEventListener("pushstate", checkDevMode);
    };
  }, []);

  return { runsDevMode: runsDevMode };
};
