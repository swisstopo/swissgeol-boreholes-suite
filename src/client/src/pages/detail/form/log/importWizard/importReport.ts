import { LogImportItemType, LogImportOutcome, LogImportResultItem } from "../logInterfaces.ts";

/** The attachment of one added log file, ready to be uploaded. */
export interface AttachmentUpload {
  logFileId: number;
  logRunId: number;
  file: File;
  identifier: string;
}

/**
 * The order the report groups are shown in: what was written first, what needs attention last.
 */
const reportOutcomeOrder: LogImportOutcome[] = ["Added", "AlreadyExists", "SkippedIncomplete", "Error"];

const typeOrder: Record<LogImportItemType, number> = { Run: 0, File: 1 };

/**
 * Sorts the report into its groups.
 *
 * The question after an import is what did not work and why, so the grouping follows the
 * outcome rather than the run a row belongs to.
 * @param items The report as the server returned it.
 * @returns One entry per non-empty group, in a fixed order, runs before files within each.
 */
export const groupByOutcome = (
  items: LogImportResultItem[],
): { outcome: LogImportOutcome; items: LogImportResultItem[] }[] =>
  reportOutcomeOrder
    .map(outcome => ({
      outcome,
      items: items.filter(i => i.outcome === outcome).sort((a, b) => typeOrder[a.type] - typeOrder[b.type]),
    }))
    .filter(group => group.items.length > 0);

/** The file name as it is stored, which is how the server names it in the report. */
const storedName = (fileName: string): string => fileName.replaceAll(" ", "_").toLowerCase();

/** The file name part of a file item's identifier, which reads "runNumber / fileName". */
const identifierFileName = (identifier: string): string => identifier.split(" / ").slice(1).join(" / ").toLowerCase();

/**
 * Pairs each added log file with the attachment the user dropped for it.
 *
 * The server has already sanitized the name in the identifier (spaces became underscores), but
 * the browser's `File.name` has not, so the comparison sanitizes the browser side the same way
 * and ignores case, matching the server's own comparison rule.
 * @param items The report as the server returned it.
 * @param attachmentsPerRun The files the wizard holds, by run number.
 * @returns One upload per added file whose attachment is held, in report order.
 */
export const attachmentsToUpload = (
  items: LogImportResultItem[],
  attachmentsPerRun: Record<string, File[]>,
): AttachmentUpload[] => {
  const uploads: AttachmentUpload[] = [];

  for (const item of items) {
    if (item.type !== "File" || item.outcome !== "Added") continue;
    if (item.logFileId === undefined || item.logRunId === undefined) continue;

    const runNumber = item.identifier.split(" / ")[0];
    const wanted = identifierFileName(item.identifier);
    const file = (attachmentsPerRun[runNumber] ?? []).find(f => storedName(f.name) === wanted);
    if (!file) continue;

    uploads.push({ logFileId: item.logFileId, logRunId: item.logRunId, file, identifier: item.identifier });
  }

  return uploads;
};
