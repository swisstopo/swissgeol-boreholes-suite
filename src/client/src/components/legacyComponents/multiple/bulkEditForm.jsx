import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";
import { produce } from "immer";
import { FormControl, FormControlLabel, Radio, RadioGroup, Stack } from "@mui/material";
import DomainDropdown from "../domain/dropdown/domainDropdown.jsx";
import DomainTree from "../domain/tree/domainTree.jsx";
import DateField from "../dateField.jsx";
import TranslationText from "../translationText.jsx";
import { Button, Form, Header, Input } from "semantic-ui-react";
import { patchBoreholes } from "../../../api-lib";
import { CancelButton, SaveButton } from "../../buttons/buttons";
import { useTranslation } from "react-i18next";

export const BulkEditForm = ({ selected, loadBoreholes }) => {
  const [fields, setFields] = useState([]);
  const [data, setData] = useState({
    project_name: { api: "custom.project_name", value: null },
    restriction: { api: "restriction", value: null },
    workgroup: { api: "workgroup", value: null },
    restriction_until: { toggle: "restriction", api: "restriction_until", value: null },
    national_interest: { api: "national_interest", value: null },
    location_precision: { api: "location_precision", value: null },
    elevation_precision: { api: "elevation_precision", value: null },
    reference_elevation_qt: { api: "qt_reference_elevation", value: null },
    reference_elevation_type: { api: "reference_elevation_type", value: null },
    borehole_type: { api: "borehole_type", value: null },
    purpose: { api: "extended.purpose", value: null },
    boreholestatus: { api: "extended.status", value: null },
    totaldepth: { api: "total_depth", value: null },
    qt_depth: { api: "depth_precision", value: null },
    top_bedrock_fresh_md: { api: "extended.top_bedrock_fresh_md", value: null },
    top_bedrock_weathered_md: { api: "custom.top_bedrock_weathered_md", value: null },
    groundwater: { api: "extended.groundwater", value: null },
    lithology_top_bedrock: { api: "custom.lithology_top_bedrock", value: null },
    lithostratigraphy_top_bedrock: { api: "custom.lithostratigraphy_top_bedrock", value: null },
    chronostratigraphy_top_bedrock: { api: "custom.chronostratigraphy_top_bedrock", value: null },
  });
  const user = useSelector(state => state.core_user);
  const dispatch = useDispatch();
  const undo = () => {
    dispatch({
      type: "EDITOR_MULTIPLE_SELECTED",
      selection: null,
    });
  };

  const { t } = useTranslation();

  const isActive = field => {
    return _.indexOf(fields, field) >= 0;
  };

  const toggle = f => {
    const newFields = [...fields];
    for (const field of f) {
      const idx = _.indexOf(newFields, field);
      if (idx >= 0) {
        newFields.splice(idx, 1);
      } else {
        newFields.push(field);
      }
    }
    setFields(newFields);
  };

  const save = () => {
    patchBoreholes(
      selected,
      fields.map(field => [data[field].api, data[field].value]),
    )
      .then(() => {
        undo();
        loadBoreholes();
      })
      .catch(function (error) {
        console.error(error);
      });
  };

  const getToggle = fields => {
    return (
      <Button
        key={fields[0]}
        active={isActive(fields[0])}
        onClick={() => {
          toggle(fields);
        }}
        size="mini"
        toggle>
        {t(fields[0])}
      </Button>
    );
  };

  const getDomain = (field, schema = null) => {
    const onSelected = selected =>
      setData({
        ...data,
        [field]: {
          ...data[field],
          value: selected.id,
        },
      });

    if (!isActive(field)) {
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
            schema={schema === null ? data[field].api : schema}
            selected={data[field].value}
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
            schema={schema === null ? data[field].api : schema}
            selected={data[field].value}
          />
        </Form.Field>
      );
    }
  };

  const getInput = (field, type = "text") => {
    if (!isActive(field)) {
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
            setData({
              ...data,
              [field]: {
                ...data[field],
                value: newValue,
              },
            });
          }}
          spellCheck="false"
          type={type}
          value={data[field].value}
        />
      </Form.Field>
    );
  };

  const getRadio = field => {
    if (!isActive(field)) {
      return null;
    }
    return (
      <Form.Field key={field}>
        <label>{t(field)}</label>
        <FormControl className="radio-group">
          <RadioGroup
            row
            value={data[field].value === true ? "TRUE" : data[field].value === false ? "FALSE" : "NULL"}
            onChange={e => {
              const newValue = e.target.value === "TRUE" ? true : e.target.value === "FALSE" ? false : null;

              setData({
                ...data,
                [field]: {
                  ...data[field],
                  value: newValue,
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
  };

  const getDate = (field, required = false) => {
    if (!isActive(field)) {
      return null;
    }
    return (
      <Form.Field required={required} key={field}>
        <label>{t(field)}</label>
        <DateField
          date={data[field].value}
          onChange={selected =>
            setData({
              ...data,
              [field]: {
                ...data[field],
                value: selected,
              },
            })
          }
        />
      </Form.Field>
    );
  };

  const getGroup = fields => {
    if (fields.every(f => f === null)) {
      return null;
    }
    return <Form.Group widths="equal">{fields}</Form.Group>;
  };

  const workgroups = user.data.workgroups.filter(w => w.disabled === null);
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
          Object.entries(data).reduce((toggles, [key, field]) => {
            const group = field.toggle ?? key;
            (toggles[group] = toggles[group] || []).push(key);
            // only allow workgroup editing if there is more than one workgroup to choose from
            if (workgroups.length < 2) {
              delete toggles["workgroup"];
            }
            return toggles;
          }, {}),
        ).map(([, fields]) => getToggle(fields))}
      </div>
      <div
        style={{
          flex: 1,
          maxHeight: "450px",
          minHeight: "250px",
          overflowY: "auto",
          padding: "0.5em",
        }}>
        {fields.length === 0 ? "Please Select the Fields to Edit" : null}
        <Form autoComplete="off" error>
          {getInput("project_name")}
          {getGroup([getDomain("restriction"), getDate("restriction_until", data.restriction.value === 20111003)])}
          {getRadio("national_interest")}
          {isActive("workgroup") ? (
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
                    setData(
                      produce(draft => {
                        draft.workgroup.value = d.value;
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
                  value={data.workgroup}
                />
              )}
            </Form.Field>
          ) : null}
          {getGroup([
            getDomain("location_precision"),
            getDomain("elevation_precision"),
            getDomain("reference_elevation_qt", "elevation_precision"),
            getDomain("reference_elevation_type"),
          ])}
          {getGroup([getDomain("borehole_type"), getDomain("purpose"), getDomain("boreholestatus")])}
          {getGroup([getInput("totaldepth", "number"), getDomain("qt_depth")])}
          {getGroup([getInput("top_bedrock_fresh_md", "number"), getInput("top_bedrock_weathered_md", "number")])}
          {getRadio("groundwater")}
          {getDomain("lithology_top_bedrock", "custom.lithology_top_bedrock")}
          {getDomain("lithostratigraphy_top_bedrock", "custom.lithostratigraphy_top_bedrock")}
          {getDomain("chronostratigraphy_top_bedrock", "custom.chronostratigraphy_top_bedrock")}
        </Form>
      </div>
      <Stack direction="row" justifyContent="flex-end" spacing={2}>
        <CancelButton
          onClick={() => {
            undo();
          }}
        />
        <SaveButton
          variant="contained"
          onClick={() => {
            save();
          }}
        />
      </Stack>
    </div>
  );
};
