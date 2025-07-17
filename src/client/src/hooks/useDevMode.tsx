import { useEffect, useState } from "react";

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
