/* eslint-disable @typescript-eslint/ban-ts-comment */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React from "react";
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

const ActionsModal = ({ setState, state, refresh }: ActionsModalProps) => {
  const history = useHistory();
  const alertContext = useContext(AlertContext);

  const handleBoreholeCreate = () => {
    // @ts-expect-error
    createBorehole(state.workgroup)
      // @ts-expect-error
      .then((response: { data: { success: boolean; id: string; message: string } }) => {
        if (response.data.success) {
          setState({ creating: true, modal: false });
          history.push("/" + response.data.id);
        } else {
          setState({ creating: false, modal: false });
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
    if (state.selectedFile !== null) {
      state.selectedFile.forEach((boreholeFile: string | Blob) => {
        combinedFormData.append("boreholesFile", boreholeFile);
      });

      if (state.selectedBoreholeAttachments !== null) {
        state.selectedBoreholeAttachments.forEach((attachment: string | Blob) => {
          combinedFormData.append("attachments", attachment);
        });
      }
      if (state.selectedLithologyFile !== null) {
        state.selectedLithologyFile.forEach((lithologyFile: string | Blob) => {
          combinedFormData.append("lithologyFile", lithologyFile);
        });
      }
    }
    importBoreholes(state.workgroup, combinedFormData).then(response => {
      setState({ creating: false, modal: false, upload: false });
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
                setState({ errorResponse: responseBody, validationErrorModal: true });
                refresh();
              }

              // If response is of type ProblemDetails, show error message.
              else {
                alertContext.error(`${responseBody}`);
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
    setState({ creating: true });
    if (state.upload === true) {
      handleBoreholeImport();
    } else {
      handleBoreholeCreate();
    }
  };

  return (
    <>
      <Segment clearing>
        <Header
          floated="left"
          content={<TranslationText id={state.upload === true ? "import" : "newBorehole"} />}
          icon={state.upload === true ? "upload" : "plus"}
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
        {state.upload === true ? <ImportModalContent setState={setState} state={state} /> : null}
        <WorkgroupSelect setState={setState} state={state} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          disabled={state.enabledWorkgroups.length === 0 || (state.upload === true && state.selectedFile?.length === 0)}
          loading={state.creating === true}
          onClick={handleFormSubmit}
          secondary>
          <Icon name={state.upload === true ? "upload" : "plus"} />{" "}
          {state.upload === true ? <TranslationText id="import" /> : <TranslationText id="create" />}
        </Button>
      </Modal.Actions>
    </>
  );
};

export default ActionsModal;
