import { Component } from "react";
import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Form, Radio } from "semantic-ui-react";
import _ from "lodash";
import PropTypes from "prop-types";
import { capitalizeFirstLetter } from "../../../../utils";

class StatusFilter extends Component {
  isVisible(filter) {
    const { settings } = this.props;
    return _.get(settings, filter) === true;
  }
  render() {
    const { search, t } = this.props;
    return (
      <Form
        size="tiny"
        style={{
          padding: "0.5em",
        }}>
        <Form.Field>
          <Radio
            checked={search.filter.role === "all"}
            label={""}
            name="radioGroup"
            onChange={() => {
              this.props.setFilter("role", "all");
            }}
          />
          <span
            style={{
              color: "black",
              fontSize: "1.1em",
              fontWeight: "bold",
            }}>
            {capitalizeFirstLetter(t("alls"))}
          </span>
        </Form.Field>
        {[
          { name: "EDIT", translationKey: "statuseditor" },
          { name: "CONTROL", translationKey: "statuscontroller" },
          { name: "VALID", translationKey: "statusvalidator" },
          { name: "PUBLIC", translationKey: "statuspublisher" },
        ].map(role => (
          <Form.Field key={"sec-" + role.translationKey}>
            <Radio
              checked={search.filter.role === role.name}
              label={""}
              data-cy={role.translationKey}
              name="radioGroup"
              onChange={() => {
                this.props.setFilter("role", role.name);
              }}
            />
            <span
              style={{
                color: "black",
                fontSize: "1.1em",
              }}>
              {capitalizeFirstLetter(t(role.translationKey))}
            </span>
          </Form.Field>
        ))}
      </Form>
    );
  }
}

StatusFilter.propTypes = {
  setFilter: PropTypes.func,
  settings: PropTypes.object,
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
  };
};

const ConnectedStatusFilter = connect(mapDispatchToProps)(withTranslation(["common"])(StatusFilter));
export default ConnectedStatusFilter;
