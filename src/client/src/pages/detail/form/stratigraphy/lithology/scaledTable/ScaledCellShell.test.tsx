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

const renderShell = (children: React.ReactNode) =>
  render(
    <I18nextProvider i18n={i18n}>
      <ScaledCellShell>{children}</ScaledCellShell>
    </I18nextProvider>,
  );

const findCopyButton = () => screen.getByLabelText("Copy to clipboard", { selector: "button" });

describe("ScaledCellShell", () => {
  it("renders its children", () => {
    renderShell("child text");
    expect(screen.getByText("child text")).toBeInTheDocument();
  });

  it("copies the cell's rendered text on copy-button click", () => {
    renderShell(<span>visible content</span>);
    fireEvent.click(findCopyButton());
    // jsdom doesn't compute innerText, so the fallback to textContent is what runs here. Either
    // path returns the same rendered text for the user-visible WYSIWYG guarantee.
    expect(copyMock).toHaveBeenCalledWith("visible content");
  });
});
