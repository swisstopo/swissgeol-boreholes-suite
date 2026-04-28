import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Backdrop, Box, Button, CircularProgress, Link, Stack } from "@mui/material";
import { useQueryClient } from "@tanstack/react-query";
import {
  boreholeQueryKey,
  importBoreholesCsv,
  importBoreholesJson,
  importBoreholesZip,
} from "../../../../api/borehole.ts";
import { downloadCodelistCsv } from "../../../../api/download.ts";
import { isJsonContentType } from "../../../../api/fetchApiV2.ts";
import { theme } from "../../../../AppTheme.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import { SideDrawerHeader } from "../../layout/sideDrawerHeader.tsx";
import { useUserWorkgroups } from "../../UserWorkgroupsContext.tsx";
import { ErrorResponse, NewBoreholeProps } from "../commons/actionsInterfaces.ts";
import WorkgroupSelect from "../commons/workgroupSelect.tsx";
import { BoreholeImportDropzone } from "./boreholeImportDropzone.tsx";

interface ImportPanelProps extends NewBoreholeProps {
  setErrorsResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>;
  setErrorDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const ImportPanel = ({ toggleDrawer, setErrorsResponse, setErrorDialogOpen }: ImportPanelProps) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { enabledWorkgroups, currentWorkgroupId } = useUserWorkgroups();

  const { showAlert } = useContext(AlertContext);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey] });
  };

  const getFileExtension = (file: File | null) => {
    if (file) {
      const lastDot = file.name.lastIndexOf(".");
      if (lastDot > 0) {
        return file.name.substring(lastDot + 1);
      }
    }
    return "";
  };

  const handleImportResponse = async (response: Response) => {
    if (response.ok) {
      showAlert(`${await response.text()} ${t("boreholesImported")}.`, "success");
      setFile(null);
      refresh();
    } else {
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
    }
  };

  const handleBoreholeImport = async () => {
    setIsLoading(true);
    const combinedFormData = new FormData();
    if (file !== null) {
      combinedFormData.append("boreholesFile", file);
    }
    try {
      let response;
      if (getFileExtension(file) === "csv") {
        response = await importBoreholesCsv(currentWorkgroupId, combinedFormData);
      } else if (getFileExtension(file) === "json") {
        response = await importBoreholesJson(currentWorkgroupId, combinedFormData);
      } else {
        response = await importBoreholesZip(currentWorkgroupId, combinedFormData);
      }
      await handleImportResponse(response);
    } catch (error) {
      console.error("Error during import", error);
      showAlert(t("boreholesImportError"), "error");
    } finally {
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
            />
            <Box>
              <Link sx={{ cursor: "pointer" }} variant="subtitle1" onClick={downloadCodelistCsv}>
                {t("csvCodeListReferenceExplanation")}
              </Link>
            </Box>
          </Stack>
        </Box>
        <Button
          variant="contained"
          data-cy={"import-button"}
          disabled={!file || enabledWorkgroups?.length === 0 || !currentWorkgroupId}
          onClick={handleBoreholeImport}>
          {t("import")}
        </Button>
      </Stack>
      {isLoading && (
        <Backdrop
          sx={{
            color: theme.palette.primary.main,
            backgroundColor: theme.palette.background.backdrop,
            zIndex: theme.zIndex.modal + 1,
          }}
          open={isLoading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      )}
    </Box>
  );
};
