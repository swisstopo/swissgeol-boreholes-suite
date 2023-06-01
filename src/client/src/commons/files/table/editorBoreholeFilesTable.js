import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  uploadBoreholeAttachment,
  detachBoreholeAttachment,
  getBoreholeAttachments,
  updateBoreholeAttachment,
} from "../../../api/fetchApiV2";

import FilesTableComponent from "./filesTableComponent";
import TranslationText from "../../form/translationText";
import { Button } from "semantic-ui-react";
import { AlertContext } from "../../alert/alertContext";
import { withTranslation } from "react-i18next";

class EditorBoreholeFilesTable extends Component {
  static propTypes = {
    id: PropTypes.number,
    unlocked: PropTypes.bool,
    t: PropTypes.func,
  };

  static contextType = AlertContext;

  constructor(props, context) {
    super(props, context);
    this.input = null;
    this.state = {
      creating: false,
      fetching: false,
      patching: null,
      upload: false,
      files: [],
      file: null,
    };
    this.loadFiles = this.loadFiles.bind(this);
    this.patch = this.patch.bind(this);
    this.patchQueued = false;
  }

  componentDidMount() {
    this.loadFiles();
  }

  patch(id, fid, currentDescription, currentIsPublic, field, value) {
    this.setState(
      {
        files: this.state.files.map(el => {
          if (el.fileId === fid) {
            var val = {};
            val[field] = value;
            return Object.assign({}, el, val);
          }
          return el;
        }),
        patching: fid,
      },
      () => {
        if (field === "public") {
          // Patch immediately
          updateBoreholeAttachment(id, fid, currentDescription, value).then(
            () => {
              this.setState({
                patching: null,
              });
            },
          );
        } else {
          // Apply delay
          if (this.patchQueued) {
            clearTimeout(this.patchQueued);
            this.patchQueued = false;
          }
          this.patchQueued = setTimeout(() => {
            updateBoreholeAttachment(id, fid, value, currentIsPublic).then(
              () => {
                this.setState({
                  patching: null,
                });
              },
            );
          }, 250);
        }
      },
    );
  }

  loadFiles() {
    if (this.props.id) {
      this.setState(
        {
          fetching: true,
          files: [],
        },
        () => {
          getBoreholeAttachments(this.props.id)
            .then(response => {
              if (response) {
                this.setState({
                  fetching: false,
                  files: response,
                });
              }
            })
            .catch(function (error) {
              console.log(error);
            });
        },
      );
    }
  }

  render() {
    const { t } = this.props;
    return this.props.id ? (
      <div
        className="flex_col flex_fill"
        style={{
          overflowY: "hidden",
        }}>
        {this.props.unlocked === true ? (
          <div className="bdms-padding-1">
            <TranslationText id="uploadNewFile" />: &nbsp;
            <input
              onChange={e => {
                const file = e.target.files[0];
                const maxSizeInBytes = 205000000; // 200 MB (as stated in the import docs)

                // If file size is less than max allowed size, upload file. Otherwise, display error message.
                if (file && file.size <= maxSizeInBytes) {
                  const formData = new FormData();
                  formData.append("file", file);
                  this.setState({
                    file: formData,
                  });
                } else {
                  this.context.error(t("maxfileSizeExceeded") + " (200 MB)");
                  this.input.value = null; // Reset the input to clear the selected file
                }
              }}
              ref={e => (this.input = e)}
              style={{
                fontFamily: "inherit",
              }}
              type="file"
            />
            <Button
              disabled={
                this.state.creating === true || this.state.file === null
              }
              loading={this.state.creating}
              data-cy="attachments-upload-button"
              onClick={() => {
                this.setState(
                  {
                    creating: true,
                  },
                  () => {
                    uploadBoreholeAttachment(
                      this.props.id,
                      this.state.file,
                    ).then(r => {
                      if (r.ok === false) {
                        if (r.status === 400) {
                          this.context.error(
                            t("errorDuplicatedUploadPerBorehole"),
                          );
                        } else {
                          this.context.error(
                            t("errorDuringBoreholeFileUpload"),
                          );
                        }
                      }
                      this.input.value = "";
                      this.setState(
                        {
                          creating: false,
                          fetching: false,
                          upload: false,
                          files: [],
                          file: null,
                        },
                        this.loadFiles,
                      );
                    });
                  },
                );
              }}
              secondary={
                this.state.creating === false && this.state.file !== null
              }>
              <TranslationText id="upload" />
            </Button>
          </div>
        ) : null}
        <FilesTableComponent
          detachFile={(id, fid) => {
            detachBoreholeAttachment(id, fid).then(() => {
              this.loadFiles();
            });
          }}
          editor
          files={this.state.files}
          id={this.props.id}
          patchFile={this.patch}
          reload={() => {
            this.loadFiles();
          }}
          unlocked={this.props.unlocked}
        />
      </div>
    ) : (
      "nothing selected"
    );
  }
}

export default withTranslation(["common"])(EditorBoreholeFilesTable);
