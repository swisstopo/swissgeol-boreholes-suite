import React from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Dropdown, Form, Header, Icon, Input, List, Modal } from "semantic-ui-react";
import _ from "lodash";
import PropTypes from "prop-types";
import { loadDomains } from "../../../../api-lib/index.js";
import DomainText from "../domainText.jsx";

class DomainTree extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalOpen: false,
      open: false,
      filter: [],
      selectedFiltersTmpl: {},
      selectedFilters: {},
      parent: {},
      levels: [],
      search: "",
      selected: this.props.selected,
      language: this.props.i18n.language,
    };

    const levels = _.keys(this.props.levels);
    levels.sort();

    for (let index = 0, len = levels.length; index < len; index++) {
      const level = parseInt(levels[index], 10);
      this.state.selectedFilters[level] = null;
      this.state.selectedFiltersTmpl[level] = null;
      this.state.levels.push(level);
      if (index > 0) {
        this.state.parent[level] = levels[index - 1];
      }
    }

    // this.state.levels.sort();
    this.handleChange = this.handleChange.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
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

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.selected !== nextProps.selected) {
      return true;
    } else if (this.state.language !== nextProps.i18n.language) {
      return true;
    } else if (!_.isEqual(this.state.search, nextState.search)) {
      return true;
    } else if (!_.isEqual(this.state.filter, nextState.filter)) {
      return true;
    } else if (!_.isEqual(this.state.modalOpen, nextState.modalOpen)) {
      return true;
    }
    return false;
  }

  handleChange(event, data) {
    const { onSelected, domains, schema } = this.props;
    if (data.value === null) {
      this.setState(
        {
          selected: null,
          search: "",
          modalOpen: false,
        },
        () => {
          if (onSelected !== undefined) {
            onSelected({
              id: null,
            });
          }
        },
      );
    } else {
      for (let i = 0; i < domains.data[schema].length; i++) {
        let h = domains.data[schema][i];
        if (h.id === data.id) {
          this.setState(
            {
              selected: h.id,
              modalOpen: false,
            },
            () => {
              if (onSelected !== undefined) {
                onSelected({ ...h });
              }
            },
          );
          break;
        }
      }
    }
  }

  handleOpen() {
    if (this.props.isEditable === true) {
      this.setState({ modalOpen: true });
    }
  }

  handleClose() {
    this.setState({ modalOpen: false });
  }

  getDomainText(id) {
    const { domains, i18n, schema } = this.props;
    if (id === null) {
      return "";
    }
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      console.debug(`asked domain (${schema}:${id}) but still loading..`);
      return "";
    }
    let found = domains.data[schema].find(function (element) {
      return element.id === id;
    });
    if (found === undefined) {
      console.error(`asked domain (${schema}:${id}:${i18n.language}) but not found.`);
      return null;
    }

    return found[i18n.language].text;
  }

  render() {
    const { domains, schema, isEditable, t } = this.props;
    if (!Object.prototype.hasOwnProperty.call(domains.data, schema)) {
      if (domains.isFetching === true) {
        return "loading translations";
      }
      return <div style={{ color: "red" }}>&quot;{schema}&quot; not in codelist</div>;
    }
    let options = [
      {
        key: "dom-opt-z",
        value: null,
        content: (
          <span
            style={{
              color: "red",
            }}>
            {t("reset")}
          </span>
        ),
      },
    ];

    let filters = {};

    let currentFilter = this.state.filter.join(".");

    for (let index = 0, l = domains.data[schema].length; index < l; index++) {
      const domain = domains.data[schema][index];
      if (
        domain.level !== null &&
        // is needed
        domain.level <= this.state.filter.length + 1 &&
        // is one of the selected levels
        this.state.levels.includes(domain.level)
      ) {
        if (
          // Level 0 is always unfiltered
          domain.level === this.state.levels[0] ||
          //
          // Parent is selected
          (Object.prototype.hasOwnProperty.call(this.state.selectedFilters, this.state.parent[domain.level]) &&
            // And is not null
            this.state.selectedFilters[this.state.parent[domain.level]] !== null &&
            // This element is child of selected parent
            _.startsWith(domain.path, this.state.selectedFilters[this.state.parent[domain.level]].path))
        ) {
          if (!Object.prototype.hasOwnProperty.call(filters, this.props.levels[domain.level])) {
            filters[this.props.levels[domain.level]] = [
              {
                key: "dom-opt-lev-z-" + this.props.levels[domain.level],
                path: null,
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
              },
            ];
          }
          filters[this.props.levels[domain.level]].push({
            key: "dom-opt-lev-" + domain.level + "-" + domain.id,
            path: domain.path,
            value: domain.id,
            text: domain[this.state.language].text,
            content: <DomainText id={domain.id} schema={schema} />,
          });
        }
      }

      if (
        domain.level !== null &&
        (this.state.filter.length === 0 || _.startsWith(domain.path, currentFilter)) &&
        (this.state.search === "" ||
          domain[this.state.language].text.toUpperCase().includes(this.state.search.toUpperCase()))
      ) {
        options.push({
          active: this.state.selected === domain.id,
          key: "dom-opt-" + domain.id,
          id: domain.id,
          conf: domain.conf,
          content: (
            <Header
              content={
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    marginLeft: 0.5 * (domain.level - this.state.filter.length) + "em",
                  }}>
                  {domain.conf !== null && Object.prototype.hasOwnProperty.call(domain.conf, "color") ? (
                    <div
                      style={{
                        backgroundColor:
                          "rgb(" +
                          domain.conf.color[0] +
                          ", " +
                          domain.conf.color[1] +
                          ", " +
                          domain.conf.color[2] +
                          ")",
                        border: "thin solid #b9b9b9",
                        marginRight: "0.5em",
                        width: "1em",
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
              style={{
                backgroundImage:
                  domain.conf !== null
                    ? Object.prototype.hasOwnProperty.call(domain.conf, "img")
                      ? 'url("' + "/img/lit/" + domain.conf.img + '")'
                      : null
                    : null,
              }}
              subheader={
                <div
                  style={{
                    color: "#787878",
                    marginLeft: 0.5 * (domain.level - this.state.filter.length) + "em",
                  }}>
                  <span style={{ fontSize: "0.8em" }}>
                    {!_.isNil(domain[this.state.language].descr) ? domain[this.state.language].descr : null}
                    {}
                  </span>
                </div>
              }
            />
          ),
        });
      }
    }

    return (
      <Modal
        onClose={this.handleClose}
        open={this.state.modalOpen}
        trigger={
          <Input
            data-cy="domain-tree"
            fluid
            icon="sitemap"
            onClick={this.handleOpen}
            value={this.getDomainText(this.state.selected)}
            readOnly={!isEditable}
          />
        }>
        <Modal.Header>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}>
            <div
              style={{
                flex: "1 1 100%",
              }}>
              {this.props.title}
            </div>
            {this.props.schema === "custom.lithostratigraphy_top_bedrock" ? (
              <div>
                <a className="link" href="https://www.strati.ch/" rel="noopener noreferrer" target="_BLANK">
                  strati.ch
                </a>
              </div>
            ) : null}
          </div>
        </Modal.Header>
        <Modal.Content>
          <div
            style={{
              minHeight: "200px",
              maxHeight: "400px",
              display: "flex",
              flexDirection: "row",
            }}>
            {this.state.levels?.length > 0 && (
              <div
                style={{
                  minWidth: "300px",
                }}>
                <Form
                  style={{
                    flex: "1 1 100%",
                  }}>
                  <Form.Field>
                    <label>{t("filterByHierarchicalUnits")}</label>
                  </Form.Field>
                </Form>
                {this.state.levels.map((lev, idx) => {
                  return lev <= this.state.filter.length + 1 ? (
                    <div
                      key={"dt-lf-" + idx}
                      style={{
                        alignItems: "center",
                        padding: "0px 0.5em 0.5em 0px",
                        display: "flex",
                        flexDirection: "row",
                      }}>
                      {idx > 0 ? (
                        <Icon
                          name="caret right"
                          style={{
                            marginLeft: 14 * (idx - 1) + "px",
                          }}
                        />
                      ) : null}
                      <Dropdown
                        //inline
                        color="grey"
                        fluid
                        onChange={(ev, data) => {
                          // Remove childs if necessary

                          const selectedFilters = {
                            ...this.state.selectedFilters,
                          };
                          const filter = [];
                          for (let index2 = 0, l = this.state.levels.length; index2 < l; index2++) {
                            const lev2 = this.state.levels[index2];
                            if (lev2 >= lev && Object.prototype.hasOwnProperty.call(selectedFilters, lev)) {
                              selectedFilters[lev2] = null;
                            } else {
                              filter.push(this.state.filter[index2]);
                            }
                          }

                          const option = _.find(data.options, {
                            value: data.value,
                          });

                          if (data.value === null) {
                            this.setState({
                              filter: filter,
                              selectedFilters: {
                                ...selectedFilters,
                              },
                            });
                          } else {
                            selectedFilters[lev] = {
                              path: option.path,
                              id: data.value,
                            };

                            this.setState({
                              filter: option.path.split("."),
                              selectedFilters: {
                                ...selectedFilters,
                              },
                            });
                          }
                        }}
                        options={filters[this.props.levels[lev]]}
                        placeholder="Filter by units"
                        selection
                        value={
                          Object.prototype.hasOwnProperty.call(this.state.selectedFilters, lev) &&
                          this.state.selectedFilters[lev] !== null
                            ? this.state.selectedFilters[lev].id
                            : null
                        }
                        readOnly={!isEditable}
                      />
                    </div>
                  ) : null;
                })}
              </div>
            )}
            <div
              style={{
                padding: "0px 0.5em 0px 0px",
                flex: "1 1 100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}>
              <div>
                <Form
                  style={{
                    flex: "1 1 100%",
                  }}>
                  <Form.Field>
                    <label>{t("filterByName")}</label>
                    <Input
                      fluid
                      icon="search"
                      onChange={e => {
                        this.setState({
                          search: e.target.value,
                        });
                      }}
                      placeholder="Search..."
                      value={this.state.search}
                      readOnly={!isEditable}
                    />
                  </Form.Field>
                </Form>
              </div>
              <div
                style={{
                  border: "1px solid rgb(160, 160, 160)",
                  marginTop: "0.5em",
                  flex: "1 1 100%",
                  overflowY: "auto",
                }}>
                <List items={options} onItemClick={this.handleChange} selection />
              </div>
            </div>
          </div>
        </Modal.Content>
      </Modal>
    );
  }
}

DomainTree.propTypes = {
  domains: PropTypes.object,
  levels: PropTypes.object,
  multiple: PropTypes.bool,
  onSelected: PropTypes.func,
  reset: PropTypes.bool,
  schema: PropTypes.string,
  search: PropTypes.bool,
  selected: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)]),
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

DomainTree.defaultProps = {
  levels: [],
  search: true,
  multiple: false,
  reset: true,
  title: null,
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

const ConnectedDomainTree = connect(mapStateToProps, mapDispatchToProps)(withTranslation("common")(DomainTree));
export default ConnectedDomainTree;
