import { useState } from "react";
import { SessionKeys } from "../../../pages/overview/SessionKey.ts";

/**
 * Whether the legend is expanded, kept in the session so it stays the same after visiting a borehole.
 * The legend starts expanded.
 */
export const useLegendExpanded = () => {
  const [expanded, setExpanded] = useState(() => sessionStorage.getItem(SessionKeys.legendExpanded) !== "false");

  const toggleExpanded = () => {
    const next = !expanded;
    sessionStorage.setItem(SessionKeys.legendExpanded, String(next));
    setExpanded(next);
  };

  return { expanded, toggleExpanded };
};
