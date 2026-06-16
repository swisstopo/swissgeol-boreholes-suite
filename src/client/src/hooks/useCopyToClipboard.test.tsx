// @vitest-environment jsdom
import { FC, PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AlertContext } from "../components/alert/alertContext";
import { AlertContextInterface } from "../components/alert/alertInterfaces";
import { useCopyToClipboard } from "./useCopyToClipboard";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const showAlert = vi.fn();
const writeText = vi.fn();

const wrapper: FC<PropsWithChildren> = ({ children }) => {
  const context: AlertContextInterface = {
    alertIsOpen: false,
    text: undefined,
    severity: undefined,
    variant: undefined,
    autoHideDuration: null,
    showAlert,
    closeAlert: vi.fn(),
  };
  return <AlertContext.Provider value={context}>{children}</AlertContext.Provider>;
};

describe("useCopyToClipboard", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("writes the text to the clipboard and shows a success alert", async () => {
    writeText.mockResolvedValue(undefined);
    const { result } = renderHook(() => useCopyToClipboard(), { wrapper });

    await act(async () => {
      await result.current("layer description");
    });

    expect(writeText).toHaveBeenCalledWith("layer description");
    expect(showAlert).toHaveBeenCalledWith("copiedToClipboard", "info", true, "outlined");
  });

  it("shows an error alert when writing to the clipboard fails", async () => {
    writeText.mockRejectedValue(new Error("denied"));
    const { result } = renderHook(() => useCopyToClipboard(), { wrapper });

    await act(async () => {
      await result.current("layer description");
    });

    expect(showAlert).toHaveBeenCalledWith("errorCopyingToClipboard", "error");
  });
});
