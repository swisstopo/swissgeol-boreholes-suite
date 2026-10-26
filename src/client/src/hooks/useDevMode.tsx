import { useEffect, useState } from "react";

/**
 * Feature-flag helper. A feature gated behind `?dev=true` / `#dev=true` ships with the rest of the
 * release and becomes visible to everyone only once the gate is removed from its component.
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
