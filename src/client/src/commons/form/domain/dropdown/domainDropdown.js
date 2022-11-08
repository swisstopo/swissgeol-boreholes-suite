import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";

import { loadDomains } from "../../../../api-lib/index";

import { Form, Header } from "semantic-ui-react";
import TranslationText from "../../translationText";

class DomainDropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: this.props.selected,
      language: this.props.i18n.language,
    };
    this.handleChange = this.handleChange.bind(this);
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
    const { onSelected, domains, schema, multiple } = this.props;
    if (multiple === true) {
      const selection = [];
      for (let i = 0; i < domains.data[schema].length; i++) {
        let h = domains.data[schema][i];
        for (var f = 0; f < data.value.length; f++) {
          const s = data.value[f];
          if (h.id === s) {
            selection.push({ ...h });
          }
        }
      }
      this.setState({ selected: data.value });
      if (onSelected !== undefined) {
        onSelected(selection);
      }
    } else {
      if (data.value === null) {
        this.setState({ selected: null });
        if (onSelected !== undefined) {
          onSelected({
            id: null,
          });
        }
      } else {
        for (let i = 0; i < domains.data[schema].length; i++) {
          let h = domains.data[schema][i];
          if (h.id === data.value) {
            this.setState({ selected: h.id });
            if (onSelected !== undefined) {
              onSelected({ ...h });
            }
            break;
          }
        }
      }
    }
  }

  render() {
    const { domains, schema, search, multiple } = this.props,
      { selected } = this.state;
    if (!domains.data.hasOwnProperty(schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      return <div style={{ color: "red" }}>"{schema}" not in codelist</div>;
    }
    let options = [];
    if (this.props.reset) {
      options.push({
        key: "dom-opt-z",
        value: null,
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
    let data = [];
    // console.log("exclude: ", this.props.exclude);
    if (this.props.exclude !== undefined) {
      data = domains.data[schema].filter(
        el => !this.props.exclude.includes(el.id),
      );
    } else {
      data = domains.data[schema];
    }
    options = _.concat(
      options,
      data.map(domain => ({
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
                {domain.conf !== null && domain.conf.hasOwnProperty("color") ? (
                  <div
                    style={{
                      width: "1em",
                      backgroundColor:
                        "1em solid rgb(" +
                        domain.conf.color[0] +
                        ", " +
                        domain.conf.color[1] +
                        ", " +
                        domain.conf.color[2] +
                        ")",
                    }}
                  />
                ) : null}
                <div
                  style={{
                    flex:
                      domain.conf !== null &&
                      domain.conf.hasOwnProperty("image")
                        ? null
                        : "1 1 100%",
                  }}>
                  {domain[this.state.language].text}
                </div>
                {domain.conf !== null && domain.conf.hasOwnProperty("image") ? (
                  <div
                    style={{
                      flex: "1 1 100%",
                      marginLeft: "1em",
                      backgroundImage:
                        'url("' +
                        process.env.PUBLIC_URL +
                        "/img/lit/" +
                        domain.conf.image +
                        '")',
                    }}
                  />
                ) : null}
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
              // !_.isNil(domain[this.state.language].descr)?
              //   domain[this.state.language].descr: null
            }
          />
        ),
      })),
    );
    return (
      <Form.Select
        data-cy="domain-dropdown"
        fluid
        multiple={multiple}
        onChange={this.handleChange}
        options={options}
        search={search}
        value={selected}
      />
    );
  }
}

DomainDropdown.propTypes = {
  exclude: PropTypes.array,
  i18n: PropTypes.shape({
    language: PropTypes.string,
  }),
  loadDomains: PropTypes.func,
  multiple: PropTypes.bool,
  onSelected: PropTypes.func,
  reset: PropTypes.bool,
  schema: PropTypes.string,
  search: PropTypes.bool,
  selected: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number),
  ]),
};

DomainDropdown.defaultProps = {
  search: true,
  multiple: false,
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
)(withTranslation("common")(DomainDropdown));
