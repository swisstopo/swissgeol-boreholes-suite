// @vitest-environment jsdom
import { FC, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, configure, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useHierarchicalDataEditProfile } from "./hierarchicalDataEditProfile.tsx";
import { NavState } from "./navigation/navState.ts";

configure({ testIdAttribute: "data-cy" });

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: "en" } }),
}));

vi.mock("../../../../components/codelist.ts", () => ({
  useCodelistSchema: () => ({ data: undefined }),
}));

vi.mock("./layerCard.jsx", () => ({ default: () => null }));
vi.mock("./layerGap.jsx", () => ({ default: () => null }));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper: FC<{ children: ReactNode }> = ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

interface HarnessProps {
  headerLabels: string[];
}

const Harness: FC<HarnessProps> = ({ headerLabels }) => {
  const navState = new NavState({ height: 500, rawLensSize: 100, contentHeights: { c: 100 } });
  const { headerCells } = useHierarchicalDataEditProfile({
    layerData: [],
    addLayer: vi.fn(),
    deleteLayer: vi.fn(),
    updateLayer: vi.fn(),
    headerLabels,
    codelistSchemaName: "test_schema",
    dataProperty: "testId",
    selectedStratigraphyID: 1,
    navState,
    setNavState: vi.fn(),
  });
  return <div data-cy="header-row">{headerCells}</div>;
};

describe("useHierarchicalDataEditProfile", () => {
  afterEach(() => cleanup());

  it("updates header labels when headerLabels prop changes", () => {
    const chronostratigraphyLabels = ["eon", "era", "period", "epoch", "subepoch", "age", "subage"];
    const lithostratigraphyLabels = ["formation", "member", "bed"];

    const { rerender } = render(<Harness headerLabels={chronostratigraphyLabels} />, {
      wrapper: createWrapper(),
    });

    for (const label of chronostratigraphyLabels) {
      expect(screen.getByText(label)).toBeDefined();
    }

    rerender(<Harness headerLabels={lithostratigraphyLabels} />);

    for (const label of lithostratigraphyLabels) {
      expect(screen.getByText(label)).toBeDefined();
    }
    for (const label of chronostratigraphyLabels) {
      expect(screen.queryByText(label)).toBeNull();
    }
  });
});
