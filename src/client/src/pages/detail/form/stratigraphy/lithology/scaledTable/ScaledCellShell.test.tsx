// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { ScaledCellShell } from "./ScaledCellShell.tsx";

const copyMock = vi.fn();
vi.mock("../../../../../../hooks/useCopyToClipboard.ts", () => ({
  useCopyToClipboard: () => copyMock,
}));

i18n.use(initReactI18next).init({
  lng: "en",
  resources: { en: { translation: { copyToClipboard: "Copy to clipboard" } } },
  interpolation: { escapeValue: false },
});

afterEach(() => {
  cleanup();
  copyMock.mockClear();
});

const renderShell = (props: { copyText: string; children: React.ReactNode }) =>
  render(
    <I18nextProvider i18n={i18n}>
      <ScaledCellShell {...props} />
    </I18nextProvider>,
  );

describe("ScaledCellShell", () => {
  it("renders its children", () => {
    renderShell({ copyText: "hi", children: "child text" });
    expect(screen.getByText("child text")).toBeInTheDocument();
  });

  it("renders a copy button that invokes useCopyToClipboard with copyText on click", () => {
    renderShell({ copyText: "payload to copy", children: "child" });
    // The copy button is CSS-hidden until hover; query by aria-label, which sidesteps the
    // role/name lookup that doesn't compute reliably for icon-only buttons in jsdom.
    const copyBtn = screen.getByLabelText("Copy to clipboard", { selector: "button" });
    fireEvent.click(copyBtn);
    expect(copyMock).toHaveBeenCalledWith("payload to copy");
  });
});
