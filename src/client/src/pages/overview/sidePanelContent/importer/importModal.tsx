import { useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";
import { importBoreholesCsv, importBoreholesJson } from "../../../../api/borehole.ts";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { ImportModalProps } from "../commons/actionsInterfaces.ts";
import WorkgroupSelect from "../commons/workgroupSelect.js";
import ImportModalContent from "./importModalContent.js";

const ImportModal = ({
  setCreating,
  setModal,
  setUpload,
  setErrorsResponse,
  setValidationErrorModal,
  selectedFile,
  setSelectedFile,
  modal,
  creating,
  enabledWorkgroups,
  workgroup,
  setWorkgroup,
  refresh,
}: ImportModalProps) => {
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();
  const [fileType, setFileType] = useState<string>(""); // Track file type

  const handleImportResponse = async (response: Response) => {
    setCreating(false);
    setModal(false);
    setUpload(false);

    if (response.ok) {
      showAlert(`${await response.text()} ${t("boreholesImported")}.`, "success");
      refresh();
    } else {
      const responseBody = await response.json();
      if (response.status === 400) {
        if (responseBody.errors) {
          // If response is of type ValidationProblemDetails, open validation error modal.
          setErrorsResponse(responseBody);
          setValidationErrorModal(true);
          refresh();
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
    if (selectedFile !== null) {
      selectedFile.forEach((file: string | Blob) => {
        combinedFormData.append("boreholesFile", file);
      });
    }
    if (fileType === "csv") {
      importBoreholesCsv(workgroup, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    } else {
      importBoreholesJson(workgroup, combinedFormData).then(response => {
        handleImportResponse(response);
      });
    }
  };

  const handleFormSubmit = async () => {
    setCreating(true);
    handleBoreholeImport();
  };

  return (
    <Modal
      closeIcon
      key="sb-em-5"
      onClose={() => {
        setModal(false);
      }}
      open={modal}
      size="large">
      <Segment clearing>
        <Header floated="left" content={<TranslationText id={"import"} />} icon={"upload"} />
        <Header as="h4" floated="right">
          <span>
            <a href={`/help/import`} rel="noopener noreferrer" target="_BLANK">
              {t("header_help")}
            </a>
          </span>
        </Header>
      </Segment>
      <Modal.Content>
        <ImportModalContent setSelectedFile={setSelectedFile} setFileType={setFileType} fileType={fileType} />
        <h3>{capitalizeFirstLetter(t("workgroup"))}</h3>
        <WorkgroupSelect workgroupId={workgroup} enabledWorkgroups={enabledWorkgroups} setWorkgroupId={setWorkgroup} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          data-cy={"import-button"}
          disabled={enabledWorkgroups?.length === 0 || selectedFile?.length === 0}
          loading={creating}
          onClick={handleFormSubmit}
          secondary>
          <Icon name={"upload"} /> {t("import")}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ImportModal;
