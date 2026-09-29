// @vitest-environment jsdom
import { FC, PropsWithChildren } from "react";
import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../api/errorClasses";
import { AlertContext } from "../components/alert/alertContext";
import { AlertContextInterface } from "../components/alert/alertInterfaces";
import { useApiErrorAlert } from "./useShowAlertOnError";

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string>) => (values?.fileName ? `${key}:${values.fileName}` : key),
  }),
}));

const showAlert = vi.fn();

const wrapper: FC<PropsWithChildren> = ({ children }) => {
  const context: AlertContextInterface = {
    alertIsOpen: false,
    text: undefined,
    showAlert,
    closeAlert: vi.fn(),
  };
  return <AlertContext.Provider value={context}>{children}</AlertContext.Provider>;
};

describe("useApiErrorAlert", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("translates the key the API sent rather than its message", () => {
    const { result } = renderHook(() => useApiErrorAlert(), { wrapper });

    act(() => {
      result.current(
        new ApiError("A file named 'gamma.las' already exists in this log run.", 400, "logFileNameAlreadyExists", {
          fileName: "gamma.las",
        }),
      );
    });

    expect(showAlert).toHaveBeenCalledWith("logFileNameAlreadyExists:gamma.las", "error");
  });

  it("falls back to the message when the API sent no key", () => {
    const { result } = renderHook(() => useApiErrorAlert(), { wrapper });

    act(() => {
      result.current(new ApiError("errorDuringFileUpload", 500));
    });

    expect(showAlert).toHaveBeenCalledWith("errorDuringFileUpload", "error");
  });

  it("falls back to the generic failure for anything that is not an API error", () => {
    const { result } = renderHook(() => useApiErrorAlert(), { wrapper });

    act(() => {
      result.current(new Error("connection reset"));
    });

    expect(showAlert).toHaveBeenCalledWith("errorWhileFetchingData", "error");
  });
});
