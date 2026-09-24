// @vitest-environment jsdom
import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { theme } from "../AppTheme.ts";
import { LoadingBackdrop } from "./loadingBackdrop.tsx";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const onCancel = vi.fn();

/** Renders the backdrop and hands back the scrim behind its status surface. */
const renderBackdrop = (cancelOnScrimClick?: boolean): Element => {
  const { container } = render(
    <ThemeProvider theme={theme}>
      <LoadingBackdrop open message="uploadingFile" onCancel={onCancel} cancelOnScrimClick={cancelOnScrimClick} />
    </ThemeProvider>,
  );

  const scrim = container.firstElementChild;
  if (scrim === null) throw new Error("The backdrop rendered nothing to click.");
  return scrim;
};

// The backdrop marks its whole subtree aria-hidden, so the button it holds is only found among
// the elements that are hidden from assistive technology.
const cancelButton = () => screen.getByRole("button", { name: "cancel", hidden: true });

describe("LoadingBackdrop", () => {
  afterEach(() => {
    cleanup();
    onCancel.mockClear();
  });

  it("gives up on the operation when the scrim is clicked", () => {
    fireEvent.click(renderBackdrop());

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("leaves the scrim inert where only the button may give up", () => {
    fireEvent.click(renderBackdrop(false));

    expect(onCancel).not.toHaveBeenCalled();
  });

  it("gives up from the button although the scrim is inert", () => {
    renderBackdrop(false);

    fireEvent.click(cancelButton());

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
