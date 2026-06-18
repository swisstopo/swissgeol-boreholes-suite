// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { I18nextProvider, initReactI18next } from "react-i18next";
import i18n from "i18next";
import { NavState } from "../../navigation/navState.ts";
import { FaciesDescription, LithologicalDescription, Lithology } from "../../stratigraphy.ts";
import { LithologyTableScaled } from "./LithologyTableScaled.tsx";

vi.mock("../lithologyLabels.tsx", () => ({
  LithologyLabels: ({ lithology }: { lithology: { id: number } }) => <div>litho-{lithology.id}</div>,
}));
vi.mock("../faciesDescriptionLabels.tsx", () => ({
  FaciesDescriptionLabels: ({ description }: { description: { id: number } }) => <div>facies-{description.id}</div>,
}));

i18n.use(initReactI18next).init({
  lng: "en",
  resources: {
    en: {
      translation: {
        copyToClipboard: "Copy to clipboard",
      },
    },
  },
  interpolation: { escapeValue: false },
});

beforeAll(() => {
  // jsdom doesn't provide ResizeObserver; NavigationChild's resize hook needs a stub.
  global.ResizeObserver = class {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
  };
});

afterEach(() => {
  cleanup();
});

const lithology = (overrides: Partial<Lithology> = {}): Lithology =>
  ({
    id: 1,
    stratigraphyId: 1,
    fromDepth: 0,
    toDepth: 10,
    isUnconsolidated: false,
    hasBedding: false,
    ...overrides,
  }) as Lithology;

const desc = (overrides: Partial<LithologicalDescription> = {}): LithologicalDescription =>
  ({
    id: 1,
    stratigraphyId: 1,
    fromDepth: 0,
    toDepth: 10,
    description: "desc",
    ...overrides,
  }) as LithologicalDescription;

const facies = (overrides: Partial<FaciesDescription> = {}): FaciesDescription =>
  ({
    id: 1,
    stratigraphyId: 1,
    fromDepth: 0,
    toDepth: 10,
    faciesId: null,
    ...overrides,
  }) as FaciesDescription;

const renderTable = (props: {
  lithologies: ReadonlyArray<Lithology>;
  lithologicalDescriptions: ReadonlyArray<LithologicalDescription>;
  faciesDescriptions: ReadonlyArray<FaciesDescription>;
}) => {
  const navState = new NavState({ height: 500, rawLensSize: 50, contentHeights: { c: 50 } });
  return render(
    <I18nextProvider i18n={i18n}>
      <LithologyTableScaled {...props} navState={navState} setNavState={vi.fn()} />
    </I18nextProvider>,
  );
};

describe("LithologyTableScaled", () => {
  it("renders one cell per layer in each of the three data columns", () => {
    renderTable({
      lithologies: [lithology({ id: 1, fromDepth: 0, toDepth: 5 }), lithology({ id: 2, fromDepth: 5, toDepth: 10 })],
      lithologicalDescriptions: [desc({ id: 11, fromDepth: 0, toDepth: 10 })],
      faciesDescriptions: [facies({ id: 21, fromDepth: 0, toDepth: 10 })],
    });
    expect(screen.getByText("litho-1")).toBeInTheDocument();
    expect(screen.getByText("litho-2")).toBeInTheDocument();
    expect(screen.getByText("desc")).toBeInTheDocument();
    expect(screen.getByText("facies-21")).toBeInTheDocument();
  });

  it("filters out layers with null depths", () => {
    renderTable({
      lithologies: [
        lithology({ id: 1, fromDepth: 0, toDepth: 5 }),
        lithology({ id: 2, fromDepth: null, toDepth: null }),
      ],
      lithologicalDescriptions: [],
      faciesDescriptions: [],
    });
    expect(screen.getByText("litho-1")).toBeInTheDocument();
    expect(screen.queryByText("litho-2")).toBeNull();
  });
});
