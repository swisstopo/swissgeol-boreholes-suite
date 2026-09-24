// @vitest-environment jsdom
import { useState } from "react";
import { ThemeProvider } from "@mui/material";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { theme } from "../../../../AppTheme.ts";
import { BoreholeImportDropzone } from "./boreholeImportDropzone.tsx";

// Translations are stubbed by their key with whatever was interpolated appended, so that the sizes
// the dropzone puts in front of the user can be read off what it rendered.
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) =>
      options === undefined ? key : `${key} ${Object.values(options).join(" ")}`,
  }),
}));

const maxDataFileSize = 210_000_000;
const maxArchiveSize = 20_000_000_000;
const megabyte = 1024 * 1024;

/** A file of a size no test can hold, which is the point of a limit measured in gigabytes. */
const fileOfSize = (name: string, type: string, size: number): File => {
  const file = new File(["borehole export"], name, { type });
  Object.defineProperty(file, "size", { value: size });
  return file;
};

/** Holds the picked file the way the import panel does, so that what was taken is on screen. */
const DropzoneHarness = () => {
  const [file, setFile] = useState<File | null>(null);

  return (
    <ThemeProvider theme={theme}>
      <BoreholeImportDropzone
        file={file}
        setFile={setFile}
        acceptedFileTypes={["text/csv", "application/json", "application/zip", "application/x-zip-compressed"]}
        maxDataFileSize={maxDataFileSize}
        maxArchiveSize={maxArchiveSize}
      />
    </ThemeProvider>
  );
};

const renderDropzone = (): HTMLInputElement => {
  const { container } = render(<DropzoneHarness />);

  const input = container.querySelector("input[type=file]");
  if (!(input instanceof HTMLInputElement)) throw new Error("The dropzone rendered no file input.");
  return input;
};

const pick = (file: File) => {
  fireEvent.change(renderDropzone(), { target: { files: [file] } });
};

describe("BoreholeImportDropzone", () => {
  afterEach(() => {
    cleanup();
  });

  it("takes an archive far larger than one request could carry", async () => {
    pick(fileOfSize("export.zip", "application/zip", 300 * megabyte));

    expect(await screen.findByText("export.zip")).toBeDefined();
  });

  it("takes an archive up to the archive limit", async () => {
    pick(fileOfSize("export.zip", "application/zip", maxArchiveSize));

    expect(await screen.findByText("export.zip")).toBeDefined();
  });

  it("refuses an archive past the archive limit, naming the limit it was held to", async () => {
    pick(fileOfSize("export.zip", "application/zip", maxArchiveSize + 1));

    expect(await screen.findByText("fileMaxSizeExceeded 20 GB")).toBeDefined();
    expect(screen.queryByText("export.zip")).toBeNull();
  });

  it("holds a csv to what one request carries, since it travels whole", async () => {
    pick(fileOfSize("boreholes.csv", "text/csv", 300 * megabyte));

    expect(await screen.findByText("fileMaxSizeExceeded 210 MB")).toBeDefined();
    expect(screen.queryByText("boreholes.csv")).toBeNull();
  });

  it("takes a csv up to the single request limit", async () => {
    pick(fileOfSize("boreholes.csv", "text/csv", maxDataFileSize));

    expect(await screen.findByText("boreholes.csv")).toBeDefined();
  });

  it("asks for what it will take, limit by limit", () => {
    renderDropzone();

    expect(screen.getByText("importFileSizeLimits 210 MB 20 GB")).toBeDefined();
  });
});
