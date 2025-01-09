import React, { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { Box, Button, Stack } from "@mui/material";
import { importBoreholesCsv, importBoreholesJson } from "../../../api/borehole.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { BoreholeImportDropzone } from "../../../components/boreholeImportDropzone.tsx";
import { SideDrawerHeader } from "../layout/sideDrawerHeader.tsx";
import { ErrorResponse, NewBoreholeProps } from "./commons/actionsInterfaces.ts";
import WorkgroupSelect from "./commons/workgroupSelect.tsx";

interface ImportPanelProps extends NewBoreholeProps {
  setErrorsResponse: React.Dispatch<React.SetStateAction<ErrorResponse | null>>;
  setValidationErrorModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const ImportPanel = ({
  workgroupId,
  enabledWorkgroups,
  setWorkgroupId,
  toggleDrawer,
  setErrorsResponse,
  setValidationErrorModal,
}: ImportPanelProps) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const { showAlert } = useContext(AlertContext);

  const [file, setFile] = useState<File | null>(null);
  const refresh = () => {
    dispatch({ type: "SEARCH_EDITOR_FILTER_REFRESH" });
  };

  const getFileExtension = (file: File | null) => {
    if (file) {
      const name = file.name;
      const lastDot = name.lastIndexOf(".");
      if (lastDot > 0) {
        return name.substring(lastDot + 1);
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
          setValidationErrorModal(true);
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
  };

  const handleBoreholeImport = () => {
    const combinedFormData = new FormData();
    if (file !== null) {
      combinedFormData.append("boreholesFile", file);
    }
    if (getFileExtension(file) === "csv") {
      importBoreholesCsv(workgroupId, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    } else {
      importBoreholesJson(workgroupId, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    }
  };

  return (
    <Stack direction="column" height={"100%"}>
      <SideDrawerHeader title={t("import")} toggleDrawer={toggleDrawer} />
      <Box sx={{ flexGrow: 1, overflow: "auto", scrollbarGutter: "stable" }}>
        <Stack direction="column" spacing={3}>
          <WorkgroupSelect
            workgroupId={workgroupId}
            enabledWorkgroups={enabledWorkgroups}
            setWorkgroupId={setWorkgroupId}
          />

          <BoreholeImportDropzone
            file={file}
            setFile={setFile}
            defaultText={"dropZoneBoreholeJsonText"}
            acceptedFileTypes={["application/json", "text/csv"]}
            maxFilesToSelectAtOnce={1}
            maxFilesToUpload={1}
          />
        </Stack>
      </Box>
      <Button
        variant="contained"
        data-cy={"import-button"}
        disabled={!file || enabledWorkgroups?.length === 0}
        onClick={handleBoreholeImport}>
        {t("import")}
      </Button>
    </Stack>
  );
};

export default ImportPanel;
