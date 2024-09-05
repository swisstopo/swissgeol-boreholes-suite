import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { produce } from "immer";
import { FormControl, FormControlLabel, Radio, RadioGroup, Stack } from "@mui/material";
import DomainDropdown from "../domain/dropdown/domainDropdown.jsx";
import DomainTree from "../domain/tree/domainTree.jsx";
import DateField from "../dateField.jsx";
import TranslationText from "../translationText.jsx";
import { Button, Form, Header, Input } from "semantic-ui-react";
import { patchBoreholes } from "../../../api-lib/index.js";
import { CancelButton, SaveButton } from "../../buttons/buttons";

class MultipleForm extends React.Component {
  constructor(props) {
    super(props);
    this.getToggle = this.getToggle.bind(this);
    this.toggle = this.toggle.bind(this);
    this.save = this.save.bind(this);
    this.isActive = this.isActive.bind(this);
    this.state = {
      // name of the fields that get updated
      fields: [],
      data: {
        // key: field name, also used for translation
        // toggle: name of the toggle button (defaults to field name)
        // api: field identifier for api
        // value: the value of the field
        project_name: { api: "custom.project_name", value: null },
        restriction: { api: "restriction", value: null },
        workgroup: { api: "workgroup", value: null },
        restriction_until: {
          toggle: "restriction",
          api: "restriction_until",
          value: null,
        },
        national_interest: { api: "national_interest", value: null },
        location_precision: { api: "location_precision", value: null },
        elevation_precision: { api: "elevation_precision", value: null },
        reference_elevation_qt: {
          api: "qt_reference_elevation",
          value: null,
        },
        reference_elevation_type: {
          api: "reference_elevation_type",
          value: null,
        },
        borehole_type: { api: "borehole_type", value: null },
        purpose: { api: "extended.purpose", value: null },
        boreholestatus: { api: "extended.status", value: null },
        totaldepth: { api: "total_depth", value: null },
        qt_depth: { api: "depth_precision", value: null },
        top_bedrock_fresh_md: { api: "extended.top_bedrock_fresh_md", value: null },
        top_bedrock_weathered_md: { api: "custom.top_bedrock_weathered_md", value: null },
        groundwater: { api: "extended.groundwater", value: null },
        lithology_top_bedrock: {
          api: "custom.lithology_top_bedrock",
          value: null,
        },
        lithostratigraphy_top_bedrock: {
          api: "custom.lithostratigraphy_top_bedrock",
          value: null,
        },
        chronostratigraphy_top_bedrock: {
          api: "custom.chronostratigraphy_top_bedrock",
          value: null,
        },
      },
    };
  }

  isActive(field) {
    return _.indexOf(this.state.fields, field) >= 0;
  }

  toggle(fields) {
    const newFields = [...this.state.fields];
    for (const field of fields) {
      let idx = _.indexOf(newFields, field);
      if (idx >= 0) {
        newFields.splice(idx, 1);
      } else {
        newFields.push(field);
      }
    }
    this.setState({
      fields: newFields,
    });
  }

  save() {
    const { undo } = this.props;
    const fields = this.state.fields.map(field => [this.state.data[field].api, this.state.data[field].value]);
    patchBoreholes(this.props.selected, fields)
      .then(() => {
        undo();
        this.props.loadBoreholes();
      })
      .catch(function (error) {
        console.error(error);
      });
  }

  getToggle(fields) {
    const { t } = this.props;
    return (
      <Button
        key={fields[0]}
        active={this.isActive(fields[0])}
        onClick={() => {
          this.toggle(fields);
        }}
        size="mini"
        toggle>
        {t(fields[0])}
      </Button>
    );
  }

  getDomain(field, schema = null) {
    const onSelected = selected =>
      this.setState({
        ...this.state,
        data: {
          ...this.state.data,
          [field]: {
            ...this.state.data[field],
            value: selected.id,
          },
        },
      });

    const { t } = this.props;
    if (!this.isActive(field)) {
      return null;
    }
    if (["lithology_top_bedrock", "lithostratigraphy_top_bedrock", "chronostratigraphy_top_bedrock"].includes(field)) {
      return (
        <Form.Field key={field}>
          <label>{t(field)}</label>
          <DomainTree
            levels={{
              1: "rock",
              2: "process",
              3: "type",
            }}
            onSelected={onSelected}
            schema={schema === null ? this.state.data[field].api : schema}
            selected={this.state.data[field].value}
            title={<TranslationText id={field} />}
            isEditable={true}
          />
        </Form.Field>
      );
    } else {
      return (
        <Form.Field key={field}>
          <label>{t(field)}</label>
          <DomainDropdown
            onSelected={onSelected}
            schema={schema === null ? this.state.data[field].api : schema}
            selected={this.state.data[field].value}
          />
        </Form.Field>
      );
    }
  }

  getInput(field, type = "text") {
    const { t } = this.props;
    if (!this.isActive(field)) {
      return null;
    }
    return (
      <Form.Field key={field}>
        <label>{t(field)}</label>
        <Input
          data-cy="text-input"
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          onChange={e => {
            let newValue = e.target.value;
            if (type === "number") {
              newValue = _.toNumber(newValue);
            }
            this.setState({
              ...this.state,
              data: {
                ...this.state.data,
                [field]: {
                  ...this.state.data[field],
                  value: newValue,
                },
              },
            });
          }}
          spellCheck="false"
          type={type}
          value={this.state.data[field].value}
        />
      </Form.Field>
    );
  }

  getRadio(field) {
    const { t } = this.props;
    if (!this.isActive(field)) {
      return null;
    }
    return (
      <Form.Field key={field}>
        <label>{t(field)}</label>
        <FormControl className="radio-group">
          <RadioGroup
            row
            value={
              this.state.data[field].value === true ? "TRUE" : this.state.data[field].value === false ? "FALSE" : "NULL"
            }
            onChange={e => {
              let newValue = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;
              this.setState({
                ...this.state,
                data: {
                  ...this.state.data,
                  [field]: {
                    ...this.state.data[field],
                    value: newValue,
                  },
                },
              });
            }}>
            <FormControlLabel
              data-cy="radio-yes"
              value="TRUE"
              control={<Radio />}
              label={<TranslationText id={"yes"} />}
            />
            <FormControlLabel
              data-cy="radio-no"
              value="FALSE"
              control={<Radio />}
              label={<TranslationText id={"no"} />}
            />
            <FormControlLabel
              data-cy="radio-np"
              value="NULL"
              control={<Radio />}
              label={<TranslationText id={"np"} />}
            />
          </RadioGroup>
        </FormControl>
      </Form.Field>
    );
  }

  getDate(field, required = false) {
    const { t } = this.props;
    if (!this.isActive(field)) {
      return null;
    }
    return (
      <Form.Field required={required} key={field}>
        <label>{t(field)}</label>
        <DateField
          date={this.state.data[field].value}
          onChange={selected =>
            this.setState({
              ...this.state,
              data: {
                ...this.state.data,
                [field]: {
                  ...this.state.data[field],
                  value: selected,
                },
              },
            })
          }
        />
      </Form.Field>
    );
  }

  getGroup(fields) {
    if (fields.every(f => f === null)) {
      return null;
    }
    return <Form.Group widths="equal">{fields}</Form.Group>;
  }

  render() {
    const { t } = this.props;
    const workgroups = this.props.user.data.workgroups.filter(w => w.disabled === null);
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}>
        <Header>Bulk modification</Header>
        <div
          style={{
            marginBottom: "1em",
            lineHeight: "2.5em",
          }}>
          {Object.entries(
            Object.entries(this.state.data).reduce((toggles, [key, field]) => {
              let group = field.toggle ?? key;
              (toggles[group] = toggles[group] || []).push(key);
              // only allow workgroup editing if there is more than one workgroup to choose from
              if (workgroups.length < 2) {
                delete toggles["workgroup"];
              }
              return toggles;
            }, {}),
          ).map(([, fields]) => this.getToggle(fields))}
        </div>
        <div
          style={{
            flex: 1,
            maxHeight: "450px",
            minHeight: "250px",
            overflowY: "auto",
            padding: "0.5em",
          }}>
          {this.state.fields.length === 0 ? "Please Select the Fields to Edit" : null}
          <Form autoComplete="off" error>
            {this.getInput("project_name")}
            {this.getGroup([
              this.getDomain("restriction"),
              this.getDate("restriction_until", this.state.data.restriction.value === 20111003),
            ])}
            {this.getRadio("national_interest")}
            {this.isActive("workgroup") ? (
              <Form.Field key={"workgroup"}>
                <label>{t("workgroup")}</label>
                {workgroups.length === 0 ? (
                  t("disabled")
                ) : workgroups.length === 1 ? (
                  workgroups[0].workgroup
                ) : (
                  <Form.Select
                    data-cy="workgroup-select"
                    fluid
                    selection
                    onChange={(e, d) => {
                      this.setState(
                        produce(draft => {
                          draft.data.workgroup.value = d.value;
                        }),
                      );
                    }}
                    options={workgroups
                      .filter(({ roles }) => roles.includes("EDIT"))
                      .map(({ id, workgroup }) => ({
                        key: id,
                        text: workgroup,
                        value: id,
                      }))}
                    value={this.state.workgroup}
                  />
                )}
              </Form.Field>
            ) : null}
            {this.getGroup([
              this.getDomain("location_precision"),
              this.getDomain("elevation_precision"),
              this.getDomain("reference_elevation_qt", "elevation_precision"),
              this.getDomain("reference_elevation_type"),
            ])}
            {this.getGroup([
              this.getDomain("borehole_type"),
              this.getDomain("purpose"),
              this.getDomain("boreholestatus"),
            ])}
            {this.getGroup([this.getInput("totaldepth", "number"), this.getDomain("qt_depth")])}
            {this.getGroup([
              this.getInput("top_bedrock_fresh_md", "number"),
              this.getInput("top_bedrock_weathered_md", "number"),
            ])}
            {this.getRadio("groundwater")}
            {this.getDomain("lithology_top_bedrock", "custom.lithology_top_bedrock")}
            {this.getDomain("lithostratigraphy_top_bedrock", "custom.lithostratigraphy_top_bedrock")}
            {this.getDomain("chronostratigraphy_top_bedrock", "custom.chronostratigraphy_top_bedrock")}
          </Form>
        </div>
        <Stack direction="row" justifyContent="flex-end" spacing={2}>
          <CancelButton
            onClick={() => {
              this.props.undo();
            }}
          />
          <SaveButton
            variant="contained"
            onClick={() => {
              this.save();
            }}
          />
        </Stack>
      </div>
    );
  }
}

MultipleForm.propTypes = {
  selected: PropTypes.array,
  undo: PropTypes.func,
};

MultipleForm.defaultProps = {
  selected: [],
};

const mapStateToProps = state => {
  return {
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    undo: () => {
      dispatch({
        type: "EDITOR_MULTIPLE_SELECTED",
        selection: null,
      });
    },
  };
};

const ConnectedMultipleForm = connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(MultipleForm));
export default ConnectedMultipleForm;
