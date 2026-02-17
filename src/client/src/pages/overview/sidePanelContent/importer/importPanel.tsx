import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Backdrop, Box, Button, CircularProgress, Link, Stack } from "@mui/material";
import { importBoreholesCsv, importBoreholesJson, importBoreholesZip } from "../../../../api/borehole.ts";
import { downloadCodelistCsv } from "../../../../api/fetchApiV2.ts";
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
const ImportPanel = ({ toggleDrawer, setErrorsResponse, setErrorDialogOpen }: ImportPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { enabledWorkgroups, currentWorkgroupId } = useUserWorkgroups();

  const { showAlert } = useContext(AlertContext);

  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const refresh = () => {
    dispatch({ type: "SEARCH_EDITOR_FILTER_REFRESH" });
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
      const responseBody = await response.json();
      if (response.status === 400) {
        if (responseBody.errors) {
          // If response is of type ValidationProblemDetails, open validation error modal.
          setErrorsResponse(responseBody);
          setErrorDialogOpen(true);
        } else {
          // If response is of type ProblemDetails, show error message.
          showAlert(responseBody.detail, "error");
        }
      } else if (response.status === 504) {
        showAlert(t("boreholesImportLongRunning"), "error");
      } else {
        showAlert(t("boreholesImportError"), "error");
      }
    }
    setIsLoading(false);
  };

  const handleBoreholeImport = () => {
    setIsLoading(true);
    const combinedFormData = new FormData();
    if (file !== null) {
      combinedFormData.append("boreholesFile", file);
    }
    if (getFileExtension(file) === "csv") {
      importBoreholesCsv(currentWorkgroupId, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    }
    if (getFileExtension(file) === "json") {
      importBoreholesJson(currentWorkgroupId, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    } else {
      importBoreholesZip(currentWorkgroupId, combinedFormData).then(response => {
        handleImportResponse(response);
      });
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
              // Todo reactivate import when lithology is fully migrated and importer is adapted to new api https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2174
              acceptedFileTypes={["text/csv"]} // "application/json",  "application/zip", "application/x-zip-compressed"
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

export default ImportPanel;
