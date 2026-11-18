// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SessionKeys } from "../../../pages/overview/SessionKey.ts";
import { LegendTheme, LegendThemeKey, legendThemes } from "./legendThemes.ts";
import { MapLegend } from "./mapLegend.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const codelistTexts: Record<number, string> = {
  20101001: "Bohrung",
  30000307: "Virtuelle Bohrung",
  20101002: "Rammsondierung",
  20101003: "Baggerschlitz",
  20101006: "Aufschluss",
  20101004: "anderer",
  20111001: "frei",
  20111002: "gesperrt",
  20111003: "gesperrt bis",
};

vi.mock("../../codelist.ts", async () => {
  const actual = await vi.importActual<typeof import("../../codelist.ts")>("../../codelist.ts");
  return {
    ...actual,
    useCodelistDisplayValues: () => (id: number) => ({ text: codelistTexts[id] ?? "", code: "" }),
  };
});

const themeOf = (key: LegendThemeKey): LegendTheme => {
  const legendTheme = legendThemes[key];
  if (!legendTheme) throw new Error(`The legend theme '${key}' is not implemented.`);
  return legendTheme;
};

const renderLegend = (legendTheme: LegendTheme, onSwitchTheme: () => void = vi.fn()) =>
  render(<MapLegend legendTheme={legendTheme} onSwitchTheme={onSwitchTheme} onHighlightBoreholes={vi.fn()} />);

const entryLabels = () =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map(item => item.textContent);

describe("MapLegend", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it("shows the title and the entries of the active theme", () => {
    renderLegend(themeOf("boreholeType"));

    expect(screen.getByRole("heading", { name: "boreholeType" })).toBeTruthy();
    expect(entryLabels()).toEqual([
      "Bohrung",
      "Virtuelle Bohrung",
      "Rammsondierung",
      "Baggerschlitz",
      "Aufschluss",
      "anderer",
      "np",
    ]);
  });

  it("separates the entry groups with a line", () => {
    renderLegend(themeOf("boreholeType"));

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    const separators = within(screen.getByRole("list")).getAllByRole("separator");

    expect(separators).toHaveLength(1);
    expect(items[4].nextElementSibling).toBe(separators[0]);
  });

  it("calls the switch handler when the switch button is clicked", () => {
    const onSwitchTheme = vi.fn();
    renderLegend(themeOf("restriction"), onSwitchTheme);

    fireEvent.click(screen.getByRole("button", { name: "switchLegend" }));

    expect(onSwitchTheme).toHaveBeenCalledOnce();
  });

  it("disables the switch button when there is only one theme", () => {
    render(
      <MapLegend legendTheme={themeOf("boreholeType")} onSwitchTheme={undefined} onHighlightBoreholes={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "switchLegend" }).hasAttribute("disabled")).toBe(true);
  });

  it("collapses and expands, and remembers the state in the session", () => {
    renderLegend(themeOf("boreholeType"));

    fireEvent.click(screen.getByRole("button", { name: "collapseLegend" }));

    const expandButton = screen.getByRole("button", { name: "expandLegend" });
    expect(expandButton.getAttribute("aria-expanded")).toBe("false");
    expect(sessionStorage.getItem(SessionKeys.legendExpanded)).toBe("false");

    fireEvent.click(expandButton);

    expect(screen.getByRole("button", { name: "collapseLegend" }).getAttribute("aria-expanded")).toBe("true");
    expect(sessionStorage.getItem(SessionKeys.legendExpanded)).toBe("true");
  });

  it("starts collapsed when it was collapsed before in this session", () => {
    sessionStorage.setItem(SessionKeys.legendExpanded, "false");

    renderLegend(themeOf("boreholeType"));

    expect(screen.getByRole("button", { name: "expandLegend" }).getAttribute("aria-expanded")).toBe("false");
  });
});
