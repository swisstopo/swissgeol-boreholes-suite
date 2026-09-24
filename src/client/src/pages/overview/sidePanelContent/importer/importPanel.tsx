import React, { useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Button, Link, Portal, Stack } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  BoreholeImportError,
  boreholeQueryKey,
  importBoreholesCsv,
  importBoreholesJson,
} from "../../../../api/borehole.ts";
import { downloadCodelistCsv } from "../../../../api/download.ts";
import { isJsonContentType } from "../../../../api/fetchApiV2.ts";
import { formatFileSize, getMaxFileSize, getMaxImportArchiveSize } from "../../../../api/fileSize.ts";
import { ArchiveJsonMissingError } from "../../../../api/zipArchive.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { LoadingBackdrop } from "../../../../components/loadingBackdrop.tsx";
import { uploadProgressHint } from "../../../../components/uploadProgressText.ts";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import { useUserWorkgroups } from "../../UserWorkgroupsContext.tsx";
import { ErrorResponse, NewBoreholeProps } from "../commons/actionsInterfaces.ts";
import WorkgroupSelect from "../commons/workgroupSelect.tsx";
import { importBoreholeArchive } from "./boreholeImport.ts";
import { BoreholeImportDropzone } from "./boreholeImportDropzone.tsx";
import { importFormatOf } from "./importFormat.ts";

interface ImportPanelProps extends NewBoreholeProps {
  setErrorsResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>;
  setErrorDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

/** What the backdrop shows while an import runs. */
interface ImportProgress {
  message: string;

  /**
   * Where the attachments have got to, present only once one of them is on the wire. That is also
   * the point from which giving up is worth offering, because nothing before it can be called off.
   */
  hint?: string;
}

const toFormData = (boreholesFile: File): FormData => {
  const combinedFormData = new FormData();
  combinedFormData.append("boreholesFile", boreholesFile);
  return combinedFormData;
};

export const ImportPanel = ({ toggleDrawer, setErrorsResponse, setErrorDialogOpen }: ImportPanelProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { editableWorkgroups, currentWorkgroupId } = useUserWorkgroups();

  const { showAlert } = useContext(AlertContext);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ImportProgress | undefined>();
  const runningImport = useRef<AbortController | null>(null);

  /**
   * Whether an import is under way. Kept beside `isLoading`, which only reaches the button on the
   * next render and so cannot turn away a second call of the handler.
   */
  const isImporting = useRef(false);

  // Nothing else gives up on a running import: closing the drawer only collapses the panel, so the
  // teardowns that reach here are the drawer's content being swapped and the page being left, and
  // neither passes through an action of its own.
  useEffect(() => () => runningImport.current?.abort(), []);

  const refresh = () => {
    // Not awaited: the refresh happens in the background and nothing waits on the refetch.
    void queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
  };

  const reportImported = (boreholeCount: number) => {
    showAlert(`${boreholeCount} ${t("boreholesImported")}.`, "success");
    setFile(null);
    refresh();
  };

  /** Reports what the server said about an import it refused, down to the rows it named. */
  const showImportError = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    const isJson = isJsonContentType(contentType);
    if (response.status === 400 && isJson) {
      const responseBody = await response.json();
      if (responseBody.errors) {
        setErrorsResponse(responseBody);
        setErrorDialogOpen(true);
      } else if (responseBody.messageKey) {
        const translatedMessage = t(responseBody.messageKey, { defaultValue: responseBody.detail });
        showAlert(translatedMessage, "error");
      } else if (responseBody.detail) {
        showAlert(responseBody.detail, "error");
      } else {
        showAlert(t("boreholesImportError"), "error");
      }
    } else if (response.status === 504) {
      showAlert(t("boreholesImportLongRunning"), "error");
    } else if (isJson) {
      const responseBody = await response.json();
      showAlert(responseBody.detail || t("boreholesImportError"), "error");
    } else {
      const errorText = await response.text();
      showAlert(errorText || t("boreholesImportError"), "error");
    }
  };

  const handleImportResponse = async (response: Response) => {
    if (!response.ok) {
      await showImportError(response);
      return;
    }

    showAlert(`${await response.text()} ${t("boreholesImported")}.`, "success");
    setFile(null);
    refresh();
  };

  const importCsv = async (workgroupId: number, boreholesFile: File) =>
    await handleImportResponse(await importBoreholesCsv(workgroupId, toFormData(boreholesFile)));

  const importJson = async (workgroupId: number, boreholesFile: File) => {
    const result = await importBoreholesJson(workgroupId, toFormData(boreholesFile));
    reportImported(result.boreholeCount ?? 0);
  };

  /**
   * Imports an archive, which is unpacked in the browser so the attachments can be uploaded one by
   * one rather than the whole archive travelling as a single request.
   */
  const importArchive = async (workgroupId: number, archive: File) => {
    const maxArchiveSize = getMaxImportArchiveSize();
    if (archive.size > maxArchiveSize) {
      showAlert(t("importArchiveTooLarge", { size: formatFileSize(maxArchiveSize) }), "error");
      return;
    }

    const controller = new AbortController();
    runningImport.current = controller;
    setProgress({ message: t("preparingUpload") });

    const outcome = await importBoreholeArchive(archive, workgroupId, {
      signal: controller.signal,
      onImported: refresh,
      onProgress: ({ fileName, current, count, transferred, total }) => {
        // Sending the bytes is only the first half of an upload: the server then stores the file
        // and answers.
        const isSent = total !== undefined && transferred >= total;
        const place = { current, count, transferred };

        setProgress({
          message: isSent ? t("storingFile", { name: fileName }) : t("uploadingFile", { name: fileName }),

          // A file that is being stored has sent all of its bytes, so naming its size again would
          // only repeat what the count just said.
          hint: uploadProgressHint(t, isSent ? place : { ...place, total }),
        });
      },
    });

    if (outcome.pendingCount > 0) {
      showAlert(
        t("boreholesImportedWithPendingAttachments", {
          boreholes: outcome.boreholeCount,
          pending: outcome.pendingCount,
        }),
        "warning",
      );
      setFile(null);
      refresh();
      return;
    }

    reportImported(outcome.boreholeCount);
  };

  /**
   * Reports a failed import, whichever of the three ways of importing raised it.
   *
   * Never fails itself: telling the user is the last thing a failing import does, so a refusal
   * whose body cannot be read falls back to the generic message rather than leaving them with none.
   */
  const reportImportFailure = async (error: unknown) => {
    if (error instanceof ArchiveJsonMissingError) {
      showAlert(t("importArchiveMissingJson"), "error");
      return;
    }

    if (error instanceof BoreholeImportError) {
      try {
        await showImportError(error.response);
        return;
      } catch (unreadableRefusal) {
        console.error("Could not read what the server said about the refused import", unreadableRefusal);
      }
    } else {
      console.error("Error during import", error);
    }

    showAlert(t("boreholesImportError"), "error");
  };

  const handleBoreholeImport = async () => {
    if (file === null || currentWorkgroupId === null || isImporting.current) return;

    isImporting.current = true;
    setIsLoading(true);
    try {
      const format = importFormatOf(file);
      if (format === "csv") {
        await importCsv(currentWorkgroupId, file);
      } else if (format === "json") {
        await importJson(currentWorkgroupId, file);
      } else {
        await importArchive(currentWorkgroupId, file);
      }
    } catch (error) {
      await reportImportFailure(error);
    } finally {
      runningImport.current = null;
      isImporting.current = false;
      setProgress(undefined);
      setIsLoading(false);
    }
  };

  return (
    <Box position="relative" height="100%">
      <Stack direction="column" height={"100%"}>
        <SideDrawerHeader title={t("import")} toggleDrawer={toggleDrawer} />
        <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
          <Stack direction="column" spacing={3}>
            <WorkgroupSelect />
            <BoreholeImportDropzone
              file={file}
              setFile={setFile}
              acceptedFileTypes={["text/csv", "application/json", "application/zip", "application/x-zip-compressed"]}
              maxDataFileSize={getMaxFileSize()}
              maxArchiveSize={getMaxImportArchiveSize()}
            />
            <Box>
              <Link sx={{ cursor: "pointer" }} variant="subtitle1" onClick={() => void downloadCodelistCsv()}>
                {t("csvCodeListReferenceExplanation")}
              </Link>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          data-cy={"import-button"}
          disabled={!file || isLoading || editableWorkgroups?.length === 0 || !currentWorkgroupId}
          onClick={() => void handleBoreholeImport()}>
          {t("import")}
        </Button>
      </Stack>
      {isLoading && (
        // Rendered outside the drawer, which hides everything inside it once it is collapsed. An
        // import keeps running when the drawer is closed, so its progress and its way out have to
        // stay on screen.
        <Portal>
          <LoadingBackdrop
            open={isLoading}
            message={progress?.message}
            hint={progress?.hint}
            onCancel={progress?.hint === undefined ? undefined : () => runningImport.current?.abort()}
            // The boreholes are committed before the first attachment goes up, and giving up
            // discards the row of every attachment still to come. That is not something a stray
            // click on the scrim should do, so only the cancel button gives up on an import.
            cancelOnScrimClick={false}
            sx={{ zIndex: theme.zIndex.modal + 1 }}
          />
        </Portal>
      )}
    </Box>
  );
};
