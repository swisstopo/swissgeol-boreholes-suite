import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { loadDomains } from "../../../../api-lib";
import { Form, Header } from "semantic-ui-react";

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
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema) && domains.isFetching === false) {
      this.props.loadDomains();
    }
  }

  handleChange(event, data) {
    const { onSelected, domains, schema, multiple, additionalValues } = this.props;
    if (multiple === true) {
      if (data.value.includes(null)) {
        this.setState({ selected: null });
        if (onSelected !== undefined) {
          onSelected({
            id: null,
          });
        }
      } else {
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
        for (let i = 0; i < additionalValues?.length; i++) {
          let h = additionalValues[i];
          for (var g = 0; g < data.value.length; g++) {
            const s = data.value[g];
            if (h.id === s) {
              selection.push({ ...h });
            }
          }
        }
        this.setState({ selected: data.value });
        if (onSelected !== undefined) {
          onSelected(selection);
        }
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
        for (let i = 0; i < additionalValues?.length; i++) {
          let h = additionalValues[i];
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
    const { domains, schema, search, multiple, additionalValues, readOnly, t } = this.props,
      { selected } = this.state;
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      return <div style={{ color: "red" }}>&quot;{schema}&quot; not in codelist</div>;
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
            {t("reset")}
          </span>
        ),
      });
    }
    let data = [];
    if (this.props.exclude !== undefined) {
      data = domains.data[schema].filter(el => !this.props.exclude.includes(el.id));
    } else {
      data = domains.data[schema];
    }
    if (additionalValues !== undefined) {
      additionalValues.forEach(value => {
        if (value.translationId !== undefined) {
          value[this.state.language].text = this.props.t("common:" + value.translationId);
        }
      });
      data = data.concat(additionalValues);
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
                {domain.conf !== null && Object.prototype.hasOwnProperty.call(domain.conf, "color") ? (
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
                      domain.conf !== null && Object.prototype.hasOwnProperty.call(domain.conf, "image")
                        ? null
                        : "1 1 100%",
                  }}>
                  {domain[this.state.language].text}
                </div>
                {domain.conf !== null && Object.prototype.hasOwnProperty.call(domain.conf, "image") ? (
                  <div
                    style={{
                      flex: "1 1 100%",
                      marginLeft: "1em",
                      backgroundImage: 'url("' + "/img/lit/" + domain.conf.image + '")',
                    }}
                  />
                ) : null}
              </div>
            }
          />
        ),
      })),
    );
    if (readOnly) {
      let selectedOption = options.find(option => option.value === selected);
      return <Form.Input fluid readOnly value={selectedOption?.text || ""} />;
    }
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
  additionalValues: PropTypes.array,
  selected: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  readOnly: PropTypes.bool,
};

DomainDropdown.defaultProps = {
  search: true,
  multiple: false,
  reset: true,
};

const mapStateToProps = state => {
  return {
    domains: state.core_domain_list,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    loadDomains: () => {
      dispatch(loadDomains());
    },
  };
};

const ConnectedDomainDropdown = connect(mapStateToProps, mapDispatchToProps)(withTranslation("common")(DomainDropdown));
export default ConnectedDomainDropdown;
