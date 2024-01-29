import React from "react";
import { connect } from "react-redux";
import _ from "lodash";
import { withTranslation } from "react-i18next";
import { withRouter } from "react-router-dom";
import { NumericFormat } from "react-number-format";
import TranslationText from "../../form/translationText";
import { FileDropzone } from "../../files/fileDropzone";
import { Box, Stack, MenuItem, Select, FormControl } from "@mui/material/";

import { Button, Header, Icon, Menu, Modal, Segment } from "semantic-ui-react";

import { createBorehole } from "../../../api-lib/index";
import { AlertContext } from "../../../components/alert/alertContext";
import SearchEditorComponent from "../../search/editor/searchEditorComponent";
import { downloadCodelistCsv, importBoreholes } from "../../../api/fetchApiV2";
import Downloadlink from "../../files/downloadlink";

let isMounted = true;

class MenuEditorSearch extends React.Component {
  static contextType = AlertContext;
  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    const wgs = this.props.user.data.workgroups.filter(
      w => w.disabled === null && w.supplier === false,
    );
    this.state = {
      creating: false,
      delete: false,
      enabledWorkgroups: wgs,
      modal: false,
      upload: false,
      selectedFile: null,
      selectedBoreholeAttachments: null,
      selectedLithologyFile: null,
      scroller: false,
      workgroup: wgs !== null && wgs.length > 0 ? wgs[0].id : null,
      validationErrorModal: false,
      errosResponse: null,
    };
  }

  handleBoreholeAttachmentChange = attachmentsFromDropzone => {
    this.setState({ selectedBoreholeAttachments: attachmentsFromDropzone });
  };

  handleLithologyFileChange = lithologyFileFromDropzone => {
    this.setState({ selectedLithologyFile: lithologyFileFromDropzone });
  };

  handleBoreholeFileChange = boreholeFileFromDropzone => {
    this.setState({ selectedFile: boreholeFileFromDropzone });
  };

  componentDidMount() {
    if (isMounted) {
      this.updateDimensions();
      window.addEventListener("resize", this.updateDimensions.bind(this));
    }
  }

  componentWillUnmount() {
    isMounted = false;
    window.removeEventListener("resize", this.updateDimensions.bind(this));
  }

  updateDimensions() {
    if (!_.isNil(this.menu) && this.menu.children.length > 0) {
      const height = this.menu.clientHeight;
      const childrenHeight = this.menu.children[0].clientHeight;
      this.setState({
        scroller: childrenHeight > height,
      });
    } else {
      this.setState({
        scroller: true,
      });
    }
  }

  SeparatorLine() {
    return (
      <Box
        style={{
          borderBottom: "0.2em solid",
          borderColor: "black",
          marginTop: "1em",
        }}
      />
    );
  }

  ExampleHeadings(headings) {
    return (
      <div
        style={{
          border: "thin solid #787878",
          padding: "1em",
          overflow: "auto",
          whiteSpace: "nowrap",
          marginTop: "0.5em",
        }}>
        {headings}
      </div>
    );
  }

  render() {
    const { history, boreholes, t } = this.props;
    return [
      <div
        key="sb-em-1"
        style={{
          color:
            boreholes.isFetching === false && boreholes.dlen === 0
              ? "red"
              : "#767676",
          borderBottom: "thin solid rgb(187, 187, 187)",
          padding: "1em 1em 0px 1em",
        }}>
        <TranslationText firstUpperCase id="boreholes" />:{" "}
        {boreholes.isFetching ? (
          <Icon loading name="spinner" />
        ) : (
          <NumericFormat
            value={boreholes.dlen}
            thousandSeparator="'"
            displayType="text"
          />
        )}
      </div>,
      <div
        className={this.state.scroller === true ? "scroller" : null}
        key="sb-em-2"
        ref={divElement => (this.menu = divElement)}
        style={{
          padding: "1em",
          flex: "1 1 100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "hidden",
          marginRight:
            this.state.scroller === true ? this.props.setting.scrollbar : "0px",
        }}>
        <SearchEditorComponent onChange={filter => {}} />
      </div>,
      <Menu
        icon="labeled"
        key="sb-em-3"
        size="mini"
        style={{
          borderTop: "thin solid rgb(187, 187, 187)",
          margin: "0px",
        }}>
        <Menu.Item
          onClick={() => {
            this.props.refresh();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon loading={boreholes.isFetching} name="refresh" size="tiny" />
          <TranslationText firstUpperCase id="refresh" />
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            this.props.reset();
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="undo" size="tiny" />
          <TranslationText firstUpperCase id="reset" />
        </Menu.Item>
      </Menu>,
      <Menu
        icon="labeled"
        key="sb-em-4"
        size="mini"
        style={{
          margin: "0px",
        }}>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          onClick={() => {
            this.setState({
              modal: true,
              upload: true,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="upload" size="tiny" />
          <TranslationText firstUpperCase id="import" />
        </Menu.Item>
        <Menu.Item
          disabled={this.props.user.data.roles.indexOf("EDIT") === -1}
          onClick={() => {
            this.setState({
              modal: true,
              upload: false,
            });
          }}
          style={{
            flex: 1,
            padding: "1.5em",
          }}>
          <Icon name="add" size="tiny" />
          <TranslationText firstUpperCase id="new" />
        </Menu.Item>
      </Menu>,
      <Modal
        closeIcon
        key="sb-em-5"
        onClose={() => {
          this.setState({
            modal: false,
          });
        }}
        open={this.state.modal === true}
        size="large">
        <Segment clearing>
          <Header
            floated="left"
            content={
              <TranslationText
                id={this.state.upload === true ? "import" : "newBorehole"}
              />
            }
            icon={this.state.upload === true ? "upload" : "plus"}
          />
          <Header as="h4" floated="right">
            <span>
              <a
                href={`${process.env.PUBLIC_URL}/help/import`}
                rel="noopener noreferrer"
                target="_BLANK">
                <TranslationText id="header_help" />
              </a>
            </span>
          </Header>
        </Segment>
        <Modal.Content>
          {this.state.upload === true ? (
            <>
              <p>
                <div>
                  <TranslationText id="csvCodeListReferenceExplanation" />
                  <Downloadlink
                    style={{ marginLeft: "0.2em" }}
                    caption="Codelist"
                    onDownload={downloadCodelistCsv}
                  />
                </div>
              </p>
              {this.SeparatorLine()}
              <h3>
                <TranslationText firstUpperCase id="boreholes" />
              </h3>
              <Stack direction="row" alignItems="flex-start">
                <Stack
                  direction="column"
                  sx={{
                    width: "50%",
                  }}>
                  <TranslationText id="csvFormatExplanation" />
                  {this.ExampleHeadings(
                    "import_id;id_geodin_shortname;id_info_geol;id_original;" +
                      "id_canton;id_geo_quat;id_geo_mol;id_geo_therm;id_top_fels;" +
                      "id_geodin;id_kernlager;original_name;project_name;alternate_name;" +
                      "restriction_id;restriction_until;national_interest;location_x;location_y;" +
                      "qt_location_id;elevation_z;qt_elevation_id;" +
                      "reference_elevation;reference_elevation_type_id;" +
                      "qt_reference_elevation_id;hrs_id;kind_id;drilling_date;" +
                      "drilling_diameter;drilling_method_id;purpose_id;spud_date;" +
                      "cuttings_id;status_id;inclination;inclination_direction;" +
                      "qt_inclination_direction_id;remarks;total_depth;qt_depth_id;" +
                      "total_depth_tvd;qt_total_depth_tvd_id;top_bedrock;" +
                      "qt_top_bedrock_id;top_bedrock_tvd;qt_top_bedrock_tvd_id;" +
                      "has_groundwater;lithology_top_bedrock_id;" +
                      "chronostratigraphy_id;lithostratigraphy_id;attachments;",
                  )}
                </Stack>
                <FileDropzone
                  onHandleFileChange={this.handleBoreholeFileChange}
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
                <Stack
                  style={{
                    width: "50%",
                  }}>
                  <TranslationText id="importBoreholeAttachment" />
                </Stack>
                <FileDropzone
                  onHandleFileChange={this.handleBoreholeAttachmentChange}
                  defaultText={"dropZoneAttachmentsText"}
                  restrictAcceptedFileTypeToCsv={false}
                  isDisabled={!this.state.selectedFile?.length > 0}
                  dataCy={"import-boreholeFile-attachments-input"}
                />
              </Stack>
              {this.SeparatorLine()}
              <h3>
                <TranslationText firstUpperCase id="lithology" />
              </h3>
              <Stack direction="row" alignItems="flex-start">
                <Stack sx={{ width: "50%" }}>
                  <TranslationText id="csvFormatExplanation" />
                  {this.ExampleHeadings(
                    "import_id;strati_import_id;strati_date;strati_name;from_depth;to_depth;" +
                      "is_last;qt_description_id;lithology_id;" +
                      "original_uscs;uscs_determination_id;uscs_1_id;grain_size_1_id;uscs_2_id;grain_size_2_id;" +
                      "is_striae;consistance_id;plasticity_id;compactness_id;cohesion_id;humidity_id;alteration_id;" +
                      "notes;original_lithology;uscs_3_ids;grain_shape_ids;grain_granularity_ids;organic_component_ids;" +
                      "debris_ids;color_ids;gradation_id;lithology_top_bedrock_id;",
                  )}
                </Stack>
                <FileDropzone
                  onHandleFileChange={this.handleLithologyFileChange}
                  defaultText={"dropZoneLithologyText"}
                  restrictAcceptedFileTypeToCsv={true}
                  maxFilesToSelectAtOnce={1}
                  maxFilesToUpload={1}
                  isDisabled={!this.state.selectedFile?.length > 0}
                  dataCy={"import-lithologyFile-input"}
                />
              </Stack>
              {this.SeparatorLine()}
            </>
          ) : null}
          <>
            <h3>
              <TranslationText firstUpperCase id="workgroup" />
            </h3>
            <div
              style={{
                padding: "1em",
              }}>
              {(() => {
                const wg = this.state.enabledWorkgroups;
                const options = wg
                  .filter(w => w.roles.indexOf("EDIT") >= 0)
                  .map(wg => ({
                    key: wg["id"],
                    text: wg["workgroup"],
                    value: wg["id"],
                  }));
                if (wg.length === 0) {
                  return <TranslationText id="disabled" />;
                } else if (wg.length === 1) {
                  return wg[0].workgroup;
                }
                return (
                  <FormControl variant="standard" sx={{ m: 1, minWidth: 120 }}>
                    <Select
                      renderValue={selected => {
                        return options.find(o => o.value === selected)?.text;
                      }}
                      onChange={(e, data) => {
                        this.setState({
                          workgroup: e.target.value,
                        });
                      }}
                      value={this.state.workgroup}>
                      {options.map(o => (
                        <MenuItem key={o.id} value={o.value}>
                          {o.text}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              })()}
            </div>
          </>
        </Modal.Content>
        <Modal.Actions>
          <Button
            disabled={
              this.state.enabledWorkgroups.length === 0 ||
              (this.state.upload === true &&
                !this.state.selectedFile?.length > 0)
            }
            loading={this.state.creating === true}
            onClick={() => {
              this.setState(
                {
                  creating: true,
                },
                () => {
                  if (this.state.upload === true) {
                    let combinedFormData = new FormData();
                    if (this.state.selectedFile !== null) {
                      this.state.selectedFile.forEach(boreholeFile => {
                        combinedFormData.append("boreholesFile", boreholeFile);
                      });

                      this.state.selectedBoreholeAttachments.forEach(
                        attachment => {
                          combinedFormData.append("attachments", attachment);
                        },
                      );
                      this.state.selectedLithologyFile.forEach(
                        lithologyFile => {
                          combinedFormData.append(
                            "lithologyFile",
                            lithologyFile,
                          );
                        },
                      );
                    }
                    importBoreholes(
                      this.state.workgroup,
                      combinedFormData,
                    ).then(response => {
                      this.setState(
                        {
                          creating: false,
                          upload: false,
                          modal: false,
                        },
                        async () => {
                          if (response.ok) {
                            this.context.success(
                              `${await response.text()} ${t(
                                "boreholesImported",
                              )}.`,
                            );
                            this.props.refresh();
                          } else {
                            let responseBody = await response.text();
                            try {
                              // Try to parse response body as JSON in case of ValidationProblemDetails
                              responseBody = JSON.parse(responseBody);
                            } finally {
                              if (response.status === 400) {
                                // If response is of type ValidationProblemDetails, open validation error modal.
                                if (responseBody.errors) {
                                  this.setState({
                                    validationErrorModal: true,
                                  });
                                  this.setState({
                                    errorResponse: responseBody,
                                  });
                                  this.props.refresh();
                                }
                                // If response is of type ProblemDetails, show error message.
                                else {
                                  this.context.error(`${responseBody}`);
                                }
                              } else if (response.status === 504) {
                                this.context.error(
                                  `${t("boreholesImportLongRunning")}`,
                                );
                              } else {
                                this.context.error(
                                  `${t("boreholesImportError")}`,
                                );
                              }
                            }
                          }
                        },
                      );
                    });
                  } else {
                    createBorehole(this.state.workgroup)
                      .then(response => {
                        if (response.data.success) {
                          this.setState(
                            {
                              creating: false,
                              modal: false,
                            },
                            () => {
                              history.push(
                                process.env.PUBLIC_URL +
                                  "/editor/" +
                                  response.data.id,
                              );
                            },
                          );
                        } else {
                          this.setState(
                            {
                              creating: false,
                              modal: false,
                            },
                            () => {
                              this.context.error(response.data.message);
                              window.location.reload();
                            },
                          );
                        }
                      })
                      .catch(function (error) {
                        console.log(error);
                      });
                  }
                },
              );
            }}
            secondary>
            <Icon name={this.state.upload === true ? "upload" : "plus"} />{" "}
            {this.state.upload === true ? (
              <TranslationText id="import" />
            ) : (
              <TranslationText id="create" />
            )}
          </Button>
        </Modal.Actions>
      </Modal>,
      <Modal
        closeIcon
        key="sb-em-5-2"
        onClose={() => {
          this.setState({
            validationErrorModal: false,
          });
        }}
        open={this.state.validationErrorModal === true}
        size="tiny">
        <Header content={t("validationErrorHeader")} />
        <Modal.Content
          style={{ maxHeight: "70vh", overflow: "auto" }}
          data-cy="borehole-import-error-modal-content">
          {this.state.errorResponse && (
            <div>
              {/* In case of API response type ProblemDetails */}
              {this.state.errorResponse.detail &&
                this.state.errorResponse.detail
                  .split("\n")
                  .filter(subString => subString.includes("was not found"))
                  .map((item, i) => <li key={item + i}>{item}</li>)}
              {/* In case of API response type ValidationProblemDetails */}
              {this.state.errorResponse.errors &&
                Object.entries(this.state.errorResponse.errors)
                  // Only display error messages for keys that are not empty
                  .filter(([key]) => key !== "")
                  .map(([key, value], index) => (
                    <div key={key + index + 1}>
                      <div>{key}</div>
                      {value.map((item, i) => (
                        <li key={item + i}>{item}</li>
                      ))}
                    </div>
                  ))}
            </div>
          )}
        </Modal.Content>
      </Modal>,
    ];
  }
}

const mapStateToProps = state => {
  return {
    leftmenu: state.leftmenu,
    home: state.home,
    search: state.search,
    editor: state.editor,
    borehole: state.core_borehole,
    boreholes: state.core_borehole_editor_list,
    setting: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: borehole => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
      dispatch({
        type: "EDITOR_BOREHOLE_SELECTED",
        selected: borehole,
      });
    },
    refresh: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_REFRESH",
      });
    },
    reset: () => {
      dispatch({
        type: "SEARCH_EDITOR_FILTER_RESET",
      });
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(["common"])(MenuEditorSearch)),
);
