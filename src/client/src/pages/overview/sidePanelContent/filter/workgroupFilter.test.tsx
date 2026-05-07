// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import type { Workgroup } from "../../../../api-lib/ReduxStateInterfaces";
import { WorkgroupFilter } from "./workgroupFilter";

i18n.use(initReactI18next).init({
  lng: "en",
  resources: { en: { translation: { workgroup: "Workgroup", disabled: "disabled" } } },
  interpolation: { escapeValue: false },
});

const renderWithI18n = (ui: React.ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

const makeWorkgroups = (n: number): Workgroup[] =>
  Array.from(
    { length: n },
    (_, i) =>
      ({
        id: i + 1,
        workgroup: `Workgroup ${i + 1}`,
        disabled: null,
      }) as unknown as Workgroup,
  );

afterEach(() => {
  cleanup();
});

describe("WorkgroupFilter", () => {
  it("renders buttons when there are <= 7 workgroups", () => {
    renderWithI18n(<WorkgroupFilter onChange={vi.fn()} workgroups={makeWorkgroups(7)} />);
    expect(screen.getByText("Workgroup 1")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("switches to dropdown when there are > 7 workgroups", () => {
    renderWithI18n(<WorkgroupFilter onChange={vi.fn()} workgroups={makeWorkgroups(8)} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("calls onChange with selected ids when a button is clicked", () => {
    const onChange = vi.fn();
    renderWithI18n(<WorkgroupFilter onChange={onChange} workgroups={makeWorkgroups(3)} />);
    fireEvent.click(screen.getByText("Workgroup 1"));
    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("calls onChange with null when the last selection is removed", () => {
    const onChange = vi.fn();
    renderWithI18n(<WorkgroupFilter onChange={onChange} workgroups={makeWorkgroups(3)} selectedWorkgroupIds={[1]} />);
    fireEvent.click(screen.getByText("Workgroup 1"));
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
