/* eslint-disable react/require-render-return */
/* eslint-disable no-unused-vars */
import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import { loadDomains } from "../../../../api-lib/index";

import { Form, Header } from "semantic-ui-react";
import TranslationText from "../../translationText";
import * as Styled from "../../../search/components/listFilterStyles.js";
import LabelReset from "../../labelReset";

class HierarchicalDataSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
      language: this.props.i18n.language,
    };
    this.handleChange = this.handleChange.bind(this);
    this.reset = this.reset.bind(this);
    this.updateSelection = this.updateSelection.bind(this);
    this.selectedIds = [];
  }

  getSelectedOption(id) {
    const { domains, schema } = this.props;
    if (id !== null) {
      for (let i = 0; i < domains.data[schema].length; i++) {
        let h = domains.data[schema][i];
        if (h.id === id) {
          return h;
        }
      }
    }
    return null;
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = { ...prevState };
    if (_.isNil(nextProps.selected)) {
      if (nextProps.multiple === true) {
        state.selected = [];
      } else {
        state.selected = null;
      }
    } else {
      state.selected = nextProps.selected;
    }
    if (nextProps.i18n.language !== prevState.language) {
      state.language = nextProps.i18n.language;
    }
    if (_.isEqual(state, prevState)) {
      return null;
    }
    return state;
  }

  componentDidMount() {
    const { domains, schema } = this.props;
    if (!domains.data.hasOwnProperty(schema) && domains.isFetching === false) {
      this.props.loadDomains();
    }
  }

  handleChange(event, data) {
    if (data.value < 0) {
      this.reset(data.value * -1);
    } else {
      this.updateSelection(data.value);
    }
  }

  updateSelection(id) {
    const { onSelected } = this.props;
    const selection = this.getSelectedOption(id);
    if (selection === null) {
      this.setState({ selected: null });
      if (onSelected !== undefined) {
        onSelected({
          id: null,
        });
      }
    } else {
      this.setState({ selected: selection.id });
      if (onSelected !== undefined) {
        onSelected({ ...selection });
      }
    }
  }

  reset(level) {
    if (this.selectedIds.length >= level) {
      this.updateSelection(this.selectedIds[level - 2]);
    }
  }

  render() {
    const { domains, schema, labels } = this.props,
      { selected } = this.state;
    if (!domains.data.hasOwnProperty(schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      return <div style={{ color: "red" }}>"{schema}" not in codelist</div>;
    }

    let selectedOption = this.getSelectedOption(selected);
    this.selectedIds = selectedOption
      ? selectedOption.path.split(".").map(id => +id)
      : [];

    let levels = [];
    labels.forEach((label, index) => {
      let options = [];
      let selected = null;
      if (this.props.reset) {
        options.push({
          key: "dom-opt-z",
          value: -(index + 1),
          text: "",
          content: (
            <span
              style={{
                color: "red",
              }}>
              <TranslationText id="reset" />
            </span>
          ),
        });
      }
      domains.data[schema].forEach(domain => {
        if (domain.level === index + 1) {
          let option = {
            key: "dom-opt-" + domain.id,
            value: domain.id,
            text: domain[this.state.language].text,
            content: (
              <Header
                content={
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                    }}>
                    <div
                      style={{
                        flex: "1 1 100%",
                      }}>
                      {domain[this.state.language].text}
                    </div>
                  </div>
                }
                subheader={
                  this.props.developer.debug === true ? (
                    <div
                      style={{
                        color: "red",
                        fontSize: "0.8em",
                      }}>
                      gcode={domain.id}
                    </div>
                  ) : null
                }
              />
            ),
          };
          if (this.selectedIds.includes(domain.id)) {
            selected = domain.id;
          }
          options.push(option);
        }
      });
      options.sort((a, b) => {
        if (a.text < b.text) {
          return -1;
        }
        if (a.text > b.text) {
          return 1;
        }
        return 0;
      });

      levels.push({
        level: index + 1,
        label: label,
        options: options,
        selected: selected,
      });
    });

    return (
      <>
        {levels.map(level => (
          <div key={level.key}>
            <Styled.Label>
              <TranslationText id={level.label} />
            </Styled.Label>
            <Styled.AttributesItem>
              <Form.Select
                data-cy="hierarchical-data-search"
                fluid
                search={true}
                onChange={this.handleChange}
                options={level.options}
                value={level.selected}
              />
            </Styled.AttributesItem>
            {this.props.reset && (
              <Styled.Reset>
                <LabelReset
                  onClick={() => {
                    this.reset(level.level);
                  }}
                />
              </Styled.Reset>
            )}
          </div>
        ))}
      </>
    );
  }
}

HierarchicalDataSearch.propTypes = {
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  onSelected: PropTypes.func,
  reset: PropTypes.bool,
  schema: PropTypes.string,
  labels: PropTypes.arrayOf(PropTypes.string),
  selected: PropTypes.number,
};

HierarchicalDataSearch.defaultProps = {
  reset: true,
};

const mapStateToProps = (state, ownProps) => {
  return {
    developer: state.developer,
    domains: state.core_domain_list,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    dispatch: dispatch,
    loadDomains: () => {
      dispatch(loadDomains());
    },
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(withTranslation("common")(HierarchicalDataSearch));
