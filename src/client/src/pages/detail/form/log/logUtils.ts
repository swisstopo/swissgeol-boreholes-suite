import { Codelist } from "../../../../api/generated";
import { FormErrors } from "../../../../components/form/form.ts";
import {
  buildErrorStructure,
  ensureDateOnly,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { LogFile, LogRun } from "./logInterfaces.ts";

export const prepareLogRunForSubmit = (data: LogRun) => {
  data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth)!;
  data.toDepth = parseFloatWithThousandsSeparator(data.toDepth)!;
  data.bitSize = parseFloatWithThousandsSeparator(data.bitSize)!;

  delete data.tmpId;
  delete data.conveyanceMethod;
  delete data.boreholeStatus;
  delete data.created;
  delete data.createdBy;
  delete data.updated;
  delete data.updatedBy;
  data.runDate = data?.runDate ? ensureDateOnly(data.runDate.toString()) : null;

  if (data.logFiles) {
    for (const file of data.logFiles) {
      delete file.tmpId;
      delete file.name;
      delete file.created;
      delete file.createdBy;
      delete file.updated;
      delete file.updatedBy;
    }
  }

  if (String(data.conveyanceMethodId) === "") data.conveyanceMethodId = null;
  if (String(data.boreholeStatusId) === "") data.boreholeStatusId = null;
};

export const getServiceOrToolArray = (
  logFiles: LogFile[] | undefined,
  codelists: Codelist[],
): (string | undefined)[] => {
  if (!logFiles) return [];
  return logFiles
    .flatMap(file => file.toolTypeCodelistIds)
    .filter((id, index, array) => array.indexOf(id) === index) // get unique ids
    .map(id => codelists.find((d: Codelist) => d.id === id)?.code ?? "");
};

export const validateRunNumber = (values: LogRun, errors: FormErrors, runs: LogRun[]) => {
  const runNumber = values.runNumber;
  if (!runNumber) {
    errors.runNumber = { type: "required", message: "required" };
  }
  if (runs.some(r => r.runNumber === runNumber && r.tmpId !== values.tmpId)) {
    errors.runNumber = { type: "manual", message: "mustBeUnique" };
  }
};

export const validateFiles = (values: LogRun, errors: FormErrors) => {
  if (!values.logFiles || values.logFiles.length === 0) return;
  const flatErrors: Record<string, string> = {};
  const seenNames = new Set<string>();
  for (const [idx, file] of values.logFiles.entries()) {
    if (!file) return;
    const missingName = !file.name || file.name.trim() === "";
    if (missingName) {
      flatErrors[`logFiles.${idx}.name`] = "required";
    } else {
      const lowerName = file.name!.toLowerCase();
      if (seenNames.has(lowerName)) {
        flatErrors[`logFiles.${idx}.name`] = "mustBeUnique";
      } else {
        seenNames.add(lowerName);
      }
    }
  }
  if (Object.keys(flatErrors).length > 0) {
    buildErrorStructure(flatErrors, errors, "required");
  }
};

export const getFileExtension = (fileName?: string, placeholder?: string): string => {
  const extension = fileName?.split(".").pop();
  return extension ? extension.toLowerCase() : (placeholder ?? "");
};

interface LogFileCsvInfo {
  requiredFilesPerRun: Record<string, string[]>;
}

export const buildFileName = (cols: string[], nameIndex: number, extensionIndex: number): string => {
  const name = cols[nameIndex]?.trim() ?? "";
  const ext = extensionIndex >= 0 ? (cols[extensionIndex]?.trim() ?? "") : "";
  return ext ? `${name}.${ext}` : name;
};

const utf16LittleEndianMark = [0xff, 0xfe];
const utf16BigEndianMark = [0xfe, 0xff];
const utf32LittleEndianMark = [0xff, 0xfe, 0x00, 0x00];
const utf32BigEndianMark = [0x00, 0x00, 0xfe, 0xff];
const probeLength = 64;

/**
 * Thrown for a CSV in an encoding that cannot be decoded in the browser. Callers have to surface
 * this: the parser reads the file names an import is expected to provide, so a file it cannot read
 * leaves the caller unable to tell a CSV without attachments from one whose attachments were lost.
 */
export class UnsupportedCsvEncodingError extends Error {
  constructor() {
    super("The CSV file is UTF-32 encoded, which the browser cannot decode.");
    this.name = "UnsupportedCsvEncodingError";
  }
}

const startsWith = (bytes: Uint8Array, mark: number[]): boolean => mark.every((byte, i) => bytes[i] === byte);

// Mirrors CsvEncoding in src/api/CsvEncoding.cs, which decides the same thing for the import the
// server actually performs. The rules are duplicated because this runs in the browser, where only
// the names of the expected attachments are needed. TODO Issue https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2813 moves that lookup to the server and
// removes this decoder along with it.
//
// Excel writes Windows-1252 for "Save As -> CSV" and UTF-8 only for "Save As -> CSV UTF-8".
// UTF-8 is self validating, so a strict decode that throws identifies the other case reliably.
// A wide encoding has to be recognised by its byte order mark instead, because a strict UTF-16
// decode accepts any even number of Windows-1252 bytes and would turn an ANSI file into CJK
// mojibake. Every byte value is legal Windows-1252, so the mark alone is not enough either: it is
// trusted only alongside the NUL bytes that a wide encoding produces. TextDecoder has no UTF-32,
// so such a file is rejected rather than silently misread.
// Each decoder consumes a byte order mark matching its own encoding. The Windows-1252 one does not,
// but it only runs on bytes that are not valid UTF-8, and a file Excel wrote as ANSI carries no mark.
const decodeCsv = (buffer: ArrayBuffer): string => {
  const probe = new Uint8Array(buffer, 0, Math.min(probeLength, buffer.byteLength));

  if (probe.includes(0)) {
    // The UTF-32 little endian mark opens with the UTF-16 little endian one, so it has to be ruled
    // out first.
    if (startsWith(probe, utf32LittleEndianMark) || startsWith(probe, utf32BigEndianMark)) {
      throw new UnsupportedCsvEncodingError();
    }
    if (startsWith(probe, utf16LittleEndianMark)) return new TextDecoder("utf-16le").decode(buffer);
    if (startsWith(probe, utf16BigEndianMark)) return new TextDecoder("utf-16be").decode(buffer);
  }

  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(buffer);
  } catch {
    return new TextDecoder("windows-1252").decode(buffer);
  }
};

export const parseLogFilesCsv = async (csvFile: File): Promise<LogFileCsvInfo> => {
  const text = decodeCsv(await csvFile.arrayBuffer());
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length === 0) return { requiredFilesPerRun: {} };

  const headers = lines[0].split(";").map(h => h.trim().toLowerCase());
  const runNumberIndex = headers.indexOf("runnumber");
  if (runNumberIndex === -1) return { requiredFilesPerRun: {} };

  const nameIndex = headers.indexOf("name");
  const extensionIndex = headers.indexOf("extension");
  const result: Record<string, string[]> = {};

  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(";");
    const runNumber = cols[runNumberIndex]?.trim();
    if (!runNumber) continue;
    result[runNumber] ??= [];
    if (nameIndex >= 0) {
      const fileName = buildFileName(cols, nameIndex, extensionIndex);
      if (fileName) result[runNumber].push(fileName);
    }
  }
  return { requiredFilesPerRun: result };
};
