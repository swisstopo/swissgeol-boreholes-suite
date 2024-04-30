import { useCallback } from "react";
import TranslationText from "../../../form/translationText";
import { FileDropzone } from "../../../files/fileDropzone";
import { Stack, Box } from "@mui/material/";
import { Button, Header, Icon, Modal, Segment } from "semantic-ui-react";
import { StackHalfWidth } from "../../../../components/baseComponents";
import { createBorehole } from "../../../../api-lib/index";
import { downloadCodelistCsv, importBoreholes } from "../../../../api/fetchApiV2";
import Downloadlink from "../../../files/downloadlink";
import { t } from "i18next";
import { useContext } from "react";
import { AlertContext } from "../../../../components/alert/alertContext";
import { useHistory } from "react-router-dom";
import WorkgroupSelect from "./workgroupSelect";

const SeparatorLine = () => {
  return (
    <Box
      style={{
        borderBottom: "0.2em solid",
        borderColor: "black",
        marginTop: "1em",
      }}
    />
  );
};

const ExampleHeadings = headings => {
  return (
    <Box
      style={{
        border: "thin solid #787878",
        padding: "1em",
        overflow: "auto",
        whiteSpace: "nowrap",
        marginTop: "0.5em",
      }}>
      {headings}
    </Box>
  );
};

const ImportModal = ({ setState, state, refresh }) => {
  const history = useHistory();
  const alertContext = useContext(AlertContext);

  const handleBoreholeAttachmentChange = useCallback(
    attachmentsFromDropzone => {
      setState({ selectedBoreholeAttachments: attachmentsFromDropzone });
    },
    [setState],
  );

  const handleLithologyFileChange = useCallback(
    lithologyFileFromDropzone => {
      setState({ selectedLithologyFile: lithologyFileFromDropzone });
    },
    [setState],
  );

  const handleBoreholeFileChange = useCallback(
    boreholeFileFromDropzone => {
      setState({ selectedFile: boreholeFileFromDropzone });
    },
    [setState],
  );

  const handleFormSubmit = async () => {
    setState({ creating: true });
    if (state.upload === true) {
      const combinedFormData = new FormData();
      if (state.selectedFile !== null) {
        state.selectedFile.forEach(boreholeFile => {
          combinedFormData.append("boreholesFile", boreholeFile);
        });

        state.selectedBoreholeAttachments.forEach(attachment => {
          combinedFormData.append("attachments", attachment);
        });
        state.selectedLithologyFile.forEach(lithologyFile => {
          combinedFormData.append("lithologyFile", lithologyFile);
        });
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
    } else {
      createBorehole(state.workgroup)
        .then(response => {
          if (response.data.success) {
            setState({ creating: true, modal: false });
            history.push("/" + response.data.id);
          } else {
            setState({ creating: false, modal: false });
            alertContext.error(response.data.message);
            window.location.reload();
          }
        })
        .catch(function (error) {
          console.log(error);
        });
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
        {state.upload === true ? (
          <>
            <p>
              <Box>
                <TranslationText id="csvCodeListReferenceExplanation" />
                <Downloadlink style={{ marginLeft: "0.2em" }} caption="Codelist" onDownload={downloadCodelistCsv} />
              </Box>
            </p>
            {SeparatorLine()}
            <h3>
              <TranslationText firstUpperCase id="boreholes" />
            </h3>
            <Stack direction="row" alignItems="flex-start">
              <StackHalfWidth direction="column">
                <TranslationText id="csvFormatExplanation" />
                {ExampleHeadings(
                  "import_id;id_geodin_shortname;id_info_geol;id_original;" +
                    "id_canton;id_geo_quat;id_geo_mol;id_geo_therm;id_top_fels;" +
                    "id_geodin;id_kernlager;original_name;project_name;alternate_name;" +
                    "restriction_id;restriction_until;national_interest;location_x;location_y;" +
                    "location_precision;elevation_z;elevation_precision_id;" +
                    "reference_elevation;reference_elevation_type_id;" +
                    "qt_reference_elevation_id;hrs_id;type_id;drilling_date;" +
                    "drilling_diameter;drilling_method_id;purpose_id;spud_date;" +
                    "cuttings_id;status_id;inclination;inclination_direction;" +
                    "qt_inclination_direction_id;remarks;total_depth;qt_depth_id;" +
                    "total_depth_tvd;qt_total_depth_tvd_id;top_bedrock;" +
                    "qt_top_bedrock_id;top_bedrock_tvd;qt_top_bedrock_tvd_id;" +
                    "has_groundwater;lithology_top_bedrock_id;" +
                    "chronostratigraphy_id;lithostratigraphy_id;attachments;",
                )}
              </StackHalfWidth>
              <FileDropzone
                onHandleFileChange={handleBoreholeFileChange}
                defaultText={"dropZoneBoreholesText"}
                restrictAcceptedFileTypeToCsv={true}
                maxFilesToSelectAtOnce={1}
                maxFilesToUpload={1}
                isDisabled={false}
                dataCy={"import-boreholeFile-input"}
              />
            </Stack>
            <h3>
              <TranslationText firstUpperCase id="attachments" />
            </h3>
            <Stack direction="row" alignItems="flex-start">
              <StackHalfWidth>
                <TranslationText id="importBoreholeAttachment" />
              </StackHalfWidth>
              <FileDropzone
                onHandleFileChange={handleBoreholeAttachmentChange}
                defaultText={"dropZoneAttachmentsText"}
                restrictAcceptedFileTypeToCsv={false}
                isDisabled={state.selectedFile?.length === 0}
                dataCy={"import-boreholeFile-attachments-input"}
              />
            </Stack>
            {SeparatorLine()}
            <h3>
              <TranslationText firstUpperCase id="lithology" />
            </h3>
            <Stack direction="row" alignItems="flex-start">
              <StackHalfWidth>
                <TranslationText id="csvFormatExplanation" />
                {ExampleHeadings(
                  "import_id;strati_import_id;strati_date;strati_name;from_depth;to_depth;" +
                    "is_last;description_quality_id;lithology_id;" +
                    "original_uscs;uscs_determination_id;uscs_1_id;grain_size_1_id;uscs_2_id;grain_size_2_id;" +
                    "is_striae;consistance_id;plasticity_id;compactness_id;cohesion_id;humidity_id;alteration_id;" +
                    "notes;original_lithology;uscs_3_ids;grain_shape_ids;grain_granularity_ids;organic_component_ids;" +
                    "debris_ids;color_ids;gradation_id;lithology_top_bedrock_id;",
                )}
              </StackHalfWidth>
              <FileDropzone
                onHandleFileChange={handleLithologyFileChange}
                defaultText={"dropZoneLithologyText"}
                restrictAcceptedFileTypeToCsv={true}
                maxFilesToSelectAtOnce={1}
                maxFilesToUpload={1}
                isDisabled={state.selectedFile?.length === 0}
                dataCy={"import-lithologyFile-input"}
              />
            </Stack>
            {SeparatorLine()}
          </>
        ) : null}
        <WorkgroupSelect setState={setState} state={state} />
      </Modal.Content>
      <Modal.Actions>
        <Button
          disabled={state.enabledWorkgroups.length === 0 || (state.upload === true && !state.selectedFile?.length > 0)}
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

export default ImportModal;
