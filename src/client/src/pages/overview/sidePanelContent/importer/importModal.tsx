import { useContext } from "react";
import { t } from "i18next";
import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";
import TranslationText from "../../../../components/legacyComponents/translationText.jsx";
import { importBoreholes } from "../../../../api/fetchApiV2.js";
import { AlertContext } from "../../../../components/alert/alertContext.tsx";
import WorkgroupSelect from "../commons/workgroupSelect.js";
import ImportModalContent from "./importModalContent.js";
import { ImportModalProps } from "../commons/actionsInterfaces.ts";

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
          let responseBody = await response.text();
          try {
            // Try to parse response body as JSON in case of ValidationProblemDetails
            responseBody = JSON.parse(responseBody);
          } finally {
            if (response.status === 400) {
              // If response is of type ValidationProblemDetails, open validation error modal.
              if (responseBody.errors) {
                setErrorsResponse(responseBody);
                setValidationErrorModal(true);
                refresh();
              }

              // If response is of type ProblemDetails, show error message.
              else {
                showAlert(responseBody.detail, "error");
              }
            } else if (response.status === 504) {
              showAlert(t("boreholesImportLongRunning"), "error");
            } else {
              showAlert(t("boreholesImportError"), "error");
            }
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
        <h3>
          <TranslationText firstUpperCase id="workgroup" />
        </h3>
        <WorkgroupSelect workgroup={workgroup} enabledWorkgroups={enabledWorkgroups} setWorkgroup={setWorkgroup} />
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
