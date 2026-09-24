/** The shapes an import arrives in. Anything that is neither a CSV nor a JSON is read as an archive. */
type ImportFormat = "csv" | "json" | "archive";

const extensionOf = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf(".");
  return lastDot > 0 ? fileName.substring(lastDot + 1) : "";
};

/**
 * What a file the user picked is imported as.
 *
 * Read in one place because two answers hang on it that have to agree: how large the file may be,
 * and which way it is imported. An archive is held to a limit of its own because it never travels
 * whole, so a file measured against that limit has to be one that is then unpacked as an archive.
 * @param file The file the user picked.
 * @returns The format it is imported as.
 */
export const importFormatOf = (file: File): ImportFormat => {
  const extension = extensionOf(file.name);
  if (extension === "csv") return "csv";
  return extension === "json" ? "json" : "archive";
};
