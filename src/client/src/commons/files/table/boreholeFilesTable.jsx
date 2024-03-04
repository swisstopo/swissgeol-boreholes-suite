import { Component } from "react";
import PropTypes from "prop-types";

import { getBoreholeAttachments } from "../../../api/fetchApiV2";

import FilesTableComponent from "./filesTableComponent";

export default class BoreholeFilesTable extends Component {
  static propTypes = {
    id: PropTypes.number,
  };

  constructor(props, context) {
    super(props, context);
    this.state = {
      files: [],
      file: null,
    };
  }

  componentDidMount() {
    this.loadFiles();
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
    return this.props.id ? (
      <div
        className="flex_col flex_fill"
        style={{
          overflowY: "hidden",
        }}>
        <FilesTableComponent
          files={this.state.files}
          id={this.props.id}
          reload={() => {
            this.loadFiles();
          }}
        />
      </div>
    ) : (
      "nothing selected"
    );
  }
}
