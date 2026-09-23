import { importBoreholesJson } from "../../../../api/borehole.ts";
import { discardPendingProfile } from "../../../../api/profile.ts";
import { profileUploadTarget, uploadResumable } from "../../../../api/resumableUpload.ts";
import { progressRefreshIntervalMs } from "../../../../api/transferProgress.ts";
import { openBoreholeArchive } from "../../../../api/zipArchive.ts";

/** Where the attachment phase of an import has got to. */
export interface ArchiveImportProgress {
  fileName: string;
  current: number;
  count: number;
  transferred: number;
  total?: number;
}

/** What an import did, whether it ran to the end or was given up on. */
export interface ArchiveImportOutcome {
  boreholeCount: number;
  uploadedCount: number;
  pendingCount: number;
}

interface ArchiveImportHandlers {
  onProgress: (progress: ArchiveImportProgress) => void;
  onImported: () => void;
  signal: AbortSignal;
}

/** Removes the row the import wrote for an attachment that never arrived. */
const discardRow = async (profileId: number) => await discardPendingProfile(profileId).catch(() => undefined);

/**
 * Imports an archive the user picked.
 *
 * The archive is unpacked here rather than on the server, so what crosses the wire is the small
 * description of the import followed by one upload per attachment. Nothing of the archive's size is
 * ever held: entries are streamed straight out of the file the user chose.
 *
 * The boreholes are committed by the first request and are never rolled back. An attachment that
 * fails, and every attachment behind it, has its row removed instead, so no row is left waiting for
 * a file that is not coming.
 * @param file The archive the user picked.
 * @param workgroupId The workgroup the boreholes are imported into.
 * @param handlers Progress, the moment the boreholes exist, and cancellation.
 * @returns What was imported and what was not.
 * @throws {ArchiveJsonMissingError} If the archive holds no description of what to import.
 * @throws {BoreholeImportError} If the server refused the boreholes.
 */
export async function importBoreholeArchive(
  file: File,
  workgroupId: number,
  { onProgress, onImported, signal }: ArchiveImportHandlers,
): Promise<ArchiveImportOutcome> {
  const archive = await openBoreholeArchive(file);

  try {
    const formData = new FormData();
    formData.append("boreholesFile", new File([archive.json], "boreholes.json", { type: "application/json" }));

    // Not cancellable: the endpoint commits in one transaction and takes no cancellation token, so
    // giving up here would hide the boreholes from the user rather than stop them being created.
    const result = await importBoreholesJson(workgroupId, formData, true);
    onImported();

    const attachments = result.attachments ?? [];
    let uploadedCount = 0;

    // Set once nothing further will be attempted, so the loop runs on to discard the rows of the
    // attachments it is skipping rather than leaving them waiting for files that are not coming.
    let stopped = false;

    for (const [index, attachment] of attachments.entries()) {
      // The contract leaves every field of an attachment optional, although the server fills them
      // all in. One that is not named whole cannot be uploaded, and without its row it cannot be
      // discarded either, so only what it does name is acted on.
      const { profileId, boreholeId, fileName } = attachment;
      if (profileId === undefined || boreholeId === undefined || fileName === undefined) {
        if (profileId !== undefined) await discardRow(profileId);
        continue;
      }

      const source = archive.entryFor(fileName);

      if (stopped || signal.aborted || source === undefined) {
        await discardRow(profileId);
        continue;
      }

      // The byte count changes faster than it can be read, so it is refreshed on an interval. The
      // last event of a file is always shown, otherwise its numbers would stop short of its size.
      let lastReportedAt = 0;

      try {
        await uploadResumable(
          source,
          profileUploadTarget,
          { boreholeId: String(boreholeId), profileId: String(profileId) },
          {
            signal,
            onProgress: ({ loaded, total }) => {
              const isSent = total !== undefined && loaded >= total;
              const now = Date.now();
              if (!isSent && now - lastReportedAt < progressRefreshIntervalMs) return;
              lastReportedAt = now;

              onProgress({
                fileName,
                current: index + 1,
                count: attachments.length,
                transferred: loaded,
                total,
              });
            },
          },
        );

        uploadedCount += 1;
      } catch {
        await discardRow(profileId);

        // The attachments behind a transport that just failed are not tried, whether the failure
        // was the user giving up or the connection going. Both leave the rest to be discarded.
        stopped = true;
      }
    }

    return {
      boreholeCount: result.boreholeCount ?? 0,
      uploadedCount,
      pendingCount: attachments.length - uploadedCount,
    };
  } finally {
    await archive.close();
  }
}
