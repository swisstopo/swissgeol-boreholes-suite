import { Component } from "react";
import PropTypes from "prop-types";

import {
  detachBoreholeAttachment,
  getBoreholeAttachments,
  updateBoreholeAttachment,
  uploadBoreholeAttachment,
} from "../../../api/fetchApiV2";

import FilesTableComponent from "./filesTableComponent";
import { Box, Button, Input } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { AlertContext } from "../../../components/alert/alertContext";
import { withTranslation } from "react-i18next";
import { styled } from "@mui/system";

export const VisuallyHiddenInput = styled(Input)({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

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
          updateBoreholeAttachment(id, fid, currentDescription, value).then(() => {
            this.setState({
              patching: null,
            });
          });
        } else {
          // Apply delay
          if (this.patchQueued) {
            clearTimeout(this.patchQueued);
            this.patchQueued = false;
          }
          this.patchQueued = setTimeout(() => {
            updateBoreholeAttachment(id, fid, value, currentIsPublic).then(() => {
              this.setState({
                patching: null,
              });
            });
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
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "10px",
            }}>
            <Button
              component="label"
              role={undefined}
              variant="outlined"
              tabIndex={-1}
              endIcon={<UploadFileIcon />}
              sx={{
                paddingLeft: "12px",
                paddingRight: "12px",
                paddingBottom: "8px",
                paddingTop: "8px",
                whiteSpace: "nowrap",
                borderRadius: "2px",
                fontWeight: 500,
                minWidth: "auto",
              }}>
              {t("upload")}
              <VisuallyHiddenInput
                type="file"
                ref={e => (this.input = e)}
                onChange={e => {
                  console.log("file selected", e.target.files[0]);
                  const file = e.target.files[0];
                  const maxSizeInBytes = 210_000_000; // 1024 x 1024 x 200 = 209715200 bytes (as stated in the import docs)

                  // If file size is less than max allowed size, upload file. Otherwise, display error message.
                  if (file && file.size <= maxSizeInBytes) {
                    const formData = new FormData();
                    formData.append("file", file);
                    this.setState({
                      creating: true,
                    });
                    uploadBoreholeAttachment(this.props.id, formData).then(r => {
                      if (r.ok === false) {
                        if (r.status === 400) {
                          this.context.showAlert(t("errorDuplicatedUploadPerBorehole"), "error");
                        } else {
                          this.context.showAlert(t("errorDuringBoreholeFileUpload"), "error");
                        }
                      }
                      this.input.value = "";
                      this.setState(
                        {
                          creating: false,
                          fetching: false,
                          upload: false,
                          files: [],
                        },
                        this.loadFiles,
                      );
                    });
                  } else {
                    this.context.error(t("maxfileSizeExceeded") + " (200 MB)");
                    this.input.value = null; // Reset the input to clear the selected file
                  }
                }}
              />
            </Button>
          </Box>
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

const TranslatedEditorBoreholeFilesTable = withTranslation(["common"])(EditorBoreholeFilesTable);
export default TranslatedEditorBoreholeFilesTable;
