// @vitest-environment jsdom
import { ReactElement } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NuqsTestingAdapter, OnUrlUpdateFunction } from "nuqs/adapters/testing";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BoreholeUrlParamsProvider } from "../../../pages/overview/boreholeUrlParamsProvider.tsx";
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

const themeOf = (key: LegendThemeKey): LegendTheme => legendThemes[key];

const renderWithUrlParams = (ui: ReactElement, searchParams = "", onUrlUpdate?: OnUrlUpdateFunction) =>
  render(
    <NuqsTestingAdapter searchParams={searchParams} onUrlUpdate={onUrlUpdate} hasMemory>
      <BoreholeUrlParamsProvider>{ui}</BoreholeUrlParamsProvider>
    </NuqsTestingAdapter>,
  );

const renderLegend = (legendTheme: LegendTheme, onSwitchTheme: () => void = vi.fn()) =>
  renderWithUrlParams(
    <MapLegend legendTheme={legendTheme} onSwitchTheme={onSwitchTheme} onHighlightBoreholes={vi.fn()} />,
  );

const entryLabels = () =>
  within(screen.getByRole("list"))
    .getAllByRole("listitem")
    .map(item => item.textContent);

describe("MapLegend", () => {
  afterEach(() => {
    cleanup();
  });

  it("shows the title and the capitalized entries of the active theme", () => {
    renderLegend(themeOf("boreholeType"));

    expect(screen.getByRole("heading", { name: "boreholeType" })).toBeTruthy();
    expect(entryLabels()).toEqual([
      "Bohrung",
      "Virtuelle Bohrung",
      "Rammsondierung",
      "Baggerschlitz",
      "Aufschluss",
      "Anderer",
      "Np",
    ]);
  });

  it("separates the entry groups with a line", () => {
    renderLegend(themeOf("boreholeType"));

    const items = within(screen.getByRole("list")).getAllByRole("listitem");
    const separators = within(screen.getByRole("list")).getAllByRole("separator");

    expect(separators).toHaveLength(1);
    expect(items[4].nextElementSibling).toBe(separators[0]);
  });

  it("separates the purpose groups with lines", () => {
    renderLegend(themeOf("purpose"));

    expect(within(screen.getByRole("list")).getAllByRole("separator")).toHaveLength(7);
  });

  it("shows an entry per length interval and one for not specified", () => {
    renderLegend(themeOf("length"));

    expect(entryLabels()).toHaveLength(9);
  });

  it("calls the switch handler when the switch button is clicked", () => {
    const onSwitchTheme = vi.fn();
    renderLegend(themeOf("restriction"), onSwitchTheme);

    fireEvent.click(screen.getByRole("button", { name: "switchLegend" }));

    expect(onSwitchTheme).toHaveBeenCalledOnce();
  });

  it("disables the switch button when there is only one theme", () => {
    renderWithUrlParams(
      <MapLegend legendTheme={themeOf("boreholeType")} onSwitchTheme={undefined} onHighlightBoreholes={vi.fn()} />,
    );

    expect(screen.getByRole("button", { name: "switchLegend" }).hasAttribute("disabled")).toBe(true);
  });

  it("collapses and expands, and keeps the state in the URL", async () => {
    const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
    renderWithUrlParams(
      <MapLegend legendTheme={themeOf("boreholeType")} onSwitchTheme={vi.fn()} onHighlightBoreholes={vi.fn()} />,
      "",
      onUrlUpdate,
    );

    fireEvent.click(screen.getByRole("button", { name: "collapseLegend" }));

    const expandButton = await screen.findByRole("button", { name: "expandLegend" });
    expect(expandButton.getAttribute("aria-expanded")).toBe("false");
    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe("?legendExpanded=false");

    fireEvent.click(expandButton);

    const collapseButton = await screen.findByRole("button", { name: "collapseLegend" });
    expect(collapseButton.getAttribute("aria-expanded")).toBe("true");
    expect(onUrlUpdate.mock.lastCall?.[0].queryString).toBe("");
  });

  it("starts collapsed when the URL says so", () => {
    renderWithUrlParams(
      <MapLegend legendTheme={themeOf("boreholeType")} onSwitchTheme={vi.fn()} onHighlightBoreholes={vi.fn()} />,
      "?legendExpanded=false",
    );

    expect(screen.getByRole("button", { name: "expandLegend" }).getAttribute("aria-expanded")).toBe("false");
  });
});
