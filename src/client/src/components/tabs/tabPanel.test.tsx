// @vitest-environment jsdom
import { FC, useState } from "react";
import { useLocation } from "react-router";
import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { theme } from "../../AppTheme";
import { TabPanel } from "./tabPanel";

const navigateTo = vi.fn();

vi.mock("react-router", () => ({
  useLocation: vi.fn(() => ({ pathname: "/1000070/log", search: "", hash: "" })),
}));

vi.mock("../../hooks/useBoreholesNavigate.tsx", () => ({
  useBoreholesNavigate: () => ({ navigateTo }),
}));

vi.mock("../../pages/settings/admin/dialogs/AddWorkgroupDialog.tsx", () => ({
  AddWorkgroupDialog: () => null,
}));

vi.mock("./tabModal.tsx", () => ({
  TabModal: () => null,
}));

/** Rebuilds the tabs array on every render, the way the panels using TabPanel do. */
const Host: FC = () => {
  const [, setRenderCount] = useState(0);

  return (
    <ThemeProvider theme={theme}>
      <button onClick={() => setRenderCount(count => count + 1)}>rerender host</button>
      <TabPanel tabs={[{ label: "Table", hash: "#table", component: <div>table</div> }]} />
    </ThemeProvider>
  );
};

describe("TabPanel", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    navigateTo.mockClear();
    vi.mocked(useLocation).mockReturnValue({ pathname: "/1000070/log", search: "", hash: "" } as ReturnType<
      typeof useLocation
    >);
  });

  it("redirects once to the first tab when the hash is missing", () => {
    render(<Host />);

    expect(navigateTo).toHaveBeenCalledTimes(1);
    expect(navigateTo).toHaveBeenCalledWith({ hash: "#table", replace: true });
  });

  // Repeating the redirect writes the URL again, and that write discards query parameters that
  // are still on their way into the address bar, such as the ones nuqs has queued.
  it("does not redirect again while the redirect is still pending and its parent re-renders", () => {
    render(<Host />);
    navigateTo.mockClear();

    fireEvent.click(screen.getByText("rerender host"));
    fireEvent.click(screen.getByText("rerender host"));

    expect(navigateTo).not.toHaveBeenCalled();
  });
});
