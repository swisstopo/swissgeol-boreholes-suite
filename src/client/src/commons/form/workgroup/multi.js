import React, { useState } from "react";
import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Form, Checkbox, Divider } from "semantic-ui-react";
import TranslationText from "../translationText";

const WorkgroupMultiselect = props => {
  const [filter, setFilter] = useState(() => {
    const tmp = props.workgroups.filter(w => w.boreholes > 0).map(w => w.id);
    props.onChange(tmp);
    return tmp;
  });

  // React.useEffect(() => {
  //   props.onChange(filter);
  // }, [filter]);

  // const total = () => {
  //   if (filter.length === 0) {
  //     return 0;
  //   }
  //   const selected = props.workgroups.filter(
  //     w => filter.indexOf(w.id) > -1
  //   );
  //   let t = 0;
  //   selected.forEach(el => {
  //     t += el.boreholes;
  //   });
  //   return t;
  // };

  return (
    <Form
      size="tiny"
      style={{
        marginBottom: "1em",
      }}>
      <Form.Field>
        <label>
          <TranslationText firstUpperCase id="workgroup" />
        </label>
        {props.all === true ? (
          <Checkbox
            checked={
              props.workgroups.filter(w => w.boreholes > 0).length ===
              filter.length
            }
            disabled={props.allDisabled === true}
            label={
              props.t("common:alls").charAt(0).toUpperCase() +
              // + props.t('common:alls').slice(1)
              // + " (x" + total() + ")"
              props.t("common:alls").slice(1) +
              (" (x" +
                props.workgroups.map(w => w.boreholes).reduce((s, v) => s + v) +
                ")")
            }
            name="radioGroup"
            onChange={(evt, { checked }) => {
              if (checked) {
                const tmp = props.workgroups
                  .filter(w => w.boreholes > 0)
                  .map(w => w.id);
                setFilter(tmp);
                props.onChange(tmp);
              } else {
                setFilter([]);
                props.onChange([]);
              }
            }}
          />
        ) : null}
      </Form.Field>
      <Divider />
      {props.workgroups.map(workgroup => (
        <Form.Field key={"sec-" + workgroup.id}>
          <Checkbox
            checked={filter.indexOf(workgroup.id) > -1}
            disabled={props.allDisabled === true || workgroup.boreholes === 0}
            label={
              workgroup[props.nameKey] +
              (workgroup.supplier === true ? " (supplier)" : "") +
              (workgroup.disabled !== null
                ? " ( " + props.t("common:disabled") + ")"
                : "") +
              (" (x" + workgroup.boreholes + ")")
            }
            name="radioGroup"
            onChange={(evt, { checked }) => {
              console.log("onChange..");
              const tmp = [...filter];
              const index = tmp.indexOf(workgroup.id);
              if (index >= 0) {
                tmp.splice(index, 1);
              } else {
                tmp.push(workgroup.id);
              }
              setFilter(tmp);
              props.onChange(tmp);
            }}
          />
        </Form.Field>
      ))}
    </Form>
  );
};

WorkgroupMultiselect.propTypes = {
  all: PropTypes.bool,
  allDisabled: PropTypes.bool,
  nameKey: PropTypes.string,
  onChange: PropTypes.func,
  t: PropTypes.func,
  workgroups: PropTypes.array,
};

WorkgroupMultiselect.defaultProps = {
  all: true,
  allDisabled: false,
  nameKey: "workgroup",
};

export default withTranslation(["common"])(WorkgroupMultiselect);
