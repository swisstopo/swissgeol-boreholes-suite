import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";
import { importBoreholes } from "../../../../api/fetchApiV2.js";
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
  selectedBoreholeAttachments,
  setSelectedBoreholeAttachments,
  setSelectedFile,
  modal,
  creating,
  enabledWorkgroups,
  workgroup,
  setWorkgroup,
  selectedLithologyFile,
  setSelectedLithologyFile,
  refresh,
}: ImportModalProps) => {
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

  const handleBoreholeImport = () => {
    const combinedFormData = new FormData();
    if (selectedFile !== null) {
      selectedFile.forEach((boreholeFile: string | Blob) => {
        combinedFormData.append("boreholesFile", boreholeFile);
      });

      if (selectedBoreholeAttachments !== null) {
        selectedBoreholeAttachments.forEach((attachment: string | Blob) => {
          combinedFormData.append("attachments", attachment);
        });
      }
      if (selectedLithologyFile !== null) {
        selectedLithologyFile.forEach((lithologyFile: string | Blob) => {
          combinedFormData.append("lithologyFile", lithologyFile);
        });
      }
    }
    importBoreholes(workgroup, combinedFormData).then(response => {
      setCreating(false);
      setModal(false);
      setUpload(false);
      (async () => {
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
      })();
    });
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
        <ImportModalContent
          setSelectedBoreholeAttachments={setSelectedBoreholeAttachments}
          setSelectedFile={setSelectedFile}
          setSelectedLithologyFile={setSelectedLithologyFile}
          selectedFile={selectedFile}
        />
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
