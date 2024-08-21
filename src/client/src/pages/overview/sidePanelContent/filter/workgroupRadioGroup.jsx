import PropTypes from "prop-types";
import { withTranslation } from "react-i18next";
import { Form, Radio } from "semantic-ui-react";

const WorkgroupRadioGroup = props => {
  return (
    <Form
      size="tiny"
      style={{
        padding: "0.5em",
      }}>
      <Form.Field>
        {props.all === true ? (
          <Radio
            checked={props.filter === "all"}
            label={props.t("common:alls").charAt(0).toUpperCase() + props.t("common:alls").slice(1)}
            name="radioGroup"
            onChange={() => {
              props.onChange("all");
            }}
          />
        ) : null}
      </Form.Field>
      {props.workgroups.map(workgroup => (
        <Form.Field key={"sec-" + workgroup.id}>
          <Radio
            checked={props.filter === workgroup.id}
            label={
              workgroup[props.nameKey] + (workgroup.disabled !== null ? " ( " + props.t("common:disabled") + ")" : "")
            }
            name="radioGroup"
            onChange={() => {
              props.onChange(workgroup.id);
            }}
          />
        </Form.Field>
      ))}
    </Form>
  );
};

WorkgroupRadioGroup.propTypes = {
  all: PropTypes.bool,
  nameKey: PropTypes.string,
  filter: PropTypes.any,
  onChange: PropTypes.func,
  t: PropTypes.func,
  workgroups: PropTypes.array,
};

WorkgroupRadioGroup.defaultProps = {
  all: true,
  nameKey: "workgroup",
};

const TranslatedWorkgroupRadioGroup = withTranslation(["common"])(WorkgroupRadioGroup);

export default TranslatedWorkgroupRadioGroup;
