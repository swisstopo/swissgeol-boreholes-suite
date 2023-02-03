import React, { Component } from "react";
import PropTypes from "prop-types";

import {
  detachFile,
  patchFile,
  getEditorBoreholeFiles,
  uploadBoreholeAttachment,
} from "../../../api-lib/index";

import FilesTableComponent from "./filesTableComponent";
import TranslationText from "../../form/translationText";
import { Button } from "semantic-ui-react";

export default class EditorBoreholeFilesTable extends Component {
  static propTypes = {
    id: PropTypes.number,
    unlocked: PropTypes.bool,
  };

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

  patch(id, fid, field, value) {
    this.setState(
      {
        files: this.state.files.map(el => {
          if (el.id === fid) {
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
          // patch immediatly
          patchFile(id, fid, field, value).then(() => {
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
            patchFile(id, fid, field, value).then(() => {
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
          getEditorBoreholeFiles(this.props.id)
            .then(response => {
              if (response.data.success) {
                this.setState({
                  fetching: false,
                  files: response.data.data,
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
                this.setState({
                  file: e.target.files[0],
                });
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
            detachFile(id, fid).then(() => {
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
