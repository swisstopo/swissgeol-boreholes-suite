import { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withTranslation } from "react-i18next";
import _ from "lodash";
import { Form, Radio } from "semantic-ui-react";
import TranslationText from "../../form/translationText";

class StatusFilter extends Component {
  isVisible(filter) {
    const { settings } = this.props;
    if (_.get(settings, filter) === true) {
      return true;
    }
    return false;
  }
  render() {
    const { search } = this.props;
    return (
      <Form
        size="tiny"
        style={{
          border: "1px solid #e0e0e0",
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
            <TranslationText firstUpperCase id="alls" />
          </span>
        </Form.Field>
        {["statusedit", "statuscontrol", "statusvalid", "statuspublic"].map(role => (
          <Form.Field key={"sec-" + role}>
            <Radio
              checked={search.filter.role === role.replace("status", "").toUpperCase()}
              label={""}
              name="radioGroup"
              onChange={() => {
                this.props.setFilter("role", role.replace("status", "").toUpperCase());
              }}
            />
            <span
              style={{
                color: "black",
                fontSize: "1.1em",
              }}>
              <TranslationText firstUpperCase id={role} />
            </span>
          </Form.Field>
        ))}
      </Form>
    );
  }
}

StatusFilter.propTypes = {
  developer: PropTypes.object,
  setFilter: PropTypes.func,
  settings: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    developer: state.developer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(StatusFilter));
