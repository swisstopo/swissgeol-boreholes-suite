/* eslint-disable @typescript-eslint/ban-ts-comment */
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { t } from "i18next";
import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";
import TranslationText from "../../../form/translationText.jsx";
import { createBorehole } from "../../../../api-lib/actions/borehole.js";
import { importBoreholes } from "../../../../api/fetchApiV2.js";
import { AlertContext } from "../../../../components/alert/alertContext.js";
import { ActionsModalProps } from "./actionsInterfaces.js";
import WorkgroupSelect from "./workgroupSelect.js";
import ImportModalContent from "./importer/importModalContent.js";

const ActionsModal = ({
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
  upload,
  creating,
  enabledWorkgroups,
  workgroup,
  setWorkgroup,
  selectedLithologyFile,
  setSelectedLithologyFile,
  refresh,
}: ActionsModalProps) => {
  const history = useHistory();
  const alertContext = useContext(AlertContext);

  const handleBoreholeCreate = () => {
    // @ts-expect-error
    createBorehole(workgroup)
      // @ts-expect-error
      .then((response: { data: { success: boolean; id: string; message: string } }) => {
        if (response.data.success) {
          setCreating(true);
          setModal(false);
          history.push("/" + response.data.id);
        } else {
          setCreating(false);
          setModal(false);
          alertContext.error(response.data.message);
          window.location.reload();
        }
      })
      .catch(function (error: string) {
        console.log(error);
      });
  };

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
          alertContext.success(`${await response.text()} ${t("boreholesImported")}.`);
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
                alertContext.error(`${responseBody.detail}`);
              }
            } else if (response.status === 504) {
              alertContext.error(`${t("boreholesImportLongRunning")}`);
            } else {
              alertContext.error(`${t("boreholesImportError")}`);
            }
          }
        }
      })();
    });
  };

  const handleFormSubmit = async () => {
    setCreating(true);
    if (upload) {
      handleBoreholeImport();
    } else {
      handleBoreholeCreate();
    }
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
        <Header
          floated="left"
          content={<TranslationText id={upload ? "import" : "newBorehole"} />}
          icon={upload ? "upload" : "plus"}
        />
        <Header as="h4" floated="right">
          <span>
            <a href={`/help/import`} rel="noopener noreferrer" target="_BLANK">
              <TranslationText id="header_help" />
            </a>
          </span>
        </Header>
      </Segment>
      <Modal.Content>
        {upload ? (
          <ImportModalContent
            setSelectedBoreholeAttachments={setSelectedBoreholeAttachments}
            setSelectedFile={setSelectedFile}
            setSelectedLithologyFile={setSelectedLithologyFile}
            selectedFile={selectedFile}
          />
        ) : null}
        <WorkgroupSelect workgroup={workgroup} enabledWorkgroups={enabledWorkgroups} setWorkgroup={setWorkgroup} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          data-cy={upload ? "import-button" : "create-button"}
          disabled={enabledWorkgroups?.length === 0 || (upload && selectedFile?.length === 0)}
          loading={creating}
          onClick={handleFormSubmit}
          secondary>
          <Icon name={upload ? "upload" : "plus"} />{" "}
          {upload ? <TranslationText id="import" /> : <TranslationText id="create" />}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default ActionsModal;
