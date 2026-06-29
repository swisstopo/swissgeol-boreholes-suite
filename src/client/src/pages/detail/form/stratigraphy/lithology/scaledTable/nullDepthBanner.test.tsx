// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import "@testing-library/jest-dom/vitest";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { NullDepthBanner } from "./nullDepthBanner.tsx";

i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        lithologyView_nLayersHiddenDueToMissingDepths_one: "{{count}} layer hidden due to missing depth values.",
        lithologyView_nLayersHiddenDueToMissingDepths_other: "{{count}} layers hidden due to missing depth values.",
      },
    },
  },
  interpolation: { escapeValue: false },
});

afterEach(() => {
  cleanup();
});

const renderBanner = (hiddenCount: number) =>
  render(
    <I18nextProvider i18n={i18n}>
      <NullDepthBanner hiddenCount={hiddenCount} />
    </I18nextProvider>,
  );

describe("NullDepthBanner", () => {
  it("returns null when hiddenCount is 0", () => {
    const { container } = renderBanner(0);
    expect(container.firstChild).toBeNull();
  });

  it("renders an alert when hiddenCount is positive", () => {
    renderBanner(3);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses the singular form when hiddenCount is 1", () => {
    renderBanner(1);
    expect(screen.getByText(/1 layer hidden/)).toBeInTheDocument();
  });

  it("uses the plural form when hiddenCount is greater than 1", () => {
    renderBanner(5);
    expect(screen.getByText(/5 layers hidden/)).toBeInTheDocument();
  });
});
