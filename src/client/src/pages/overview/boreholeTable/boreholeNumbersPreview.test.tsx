// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";

// Not awaited: the test harness only needs the resources registered synchronously.
void i18n.use(initReactI18next).init({
  lng: "en",
  resources: { en: { translation: { boreholes: "boreholes" } } },
  interpolation: { escapeValue: false },
});

const renderPreview = (boreholeCount: number, isLoading: boolean) =>
  render(
    <I18nextProvider i18n={i18n}>
      <BoreholeNumbersPreview boreholeCount={boreholeCount} isLoading={isLoading} />
    </I18nextProvider>,
  );

afterEach(() => {
  cleanup();
});

describe("BoreholeNumbersPreview", () => {
  it("shows a progress indicator instead of a count while the boreholes load", () => {
    renderPreview(0, true);

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows the count with a thousands separator once the boreholes are loaded", () => {
    renderPreview(38500, false);

    expect(screen.getByText("38'500")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });
});
