import { withTranslation } from "react-i18next";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { useAuth } from "../../auth/useBdmsAuth";
import ListItem from "../../components/legacyComponents/listItem";

const MenuSettings = props => {
  const { history, t, location } = props;
  const auth = useAuth();

  return (
    <div>
      {!auth.anonymousModeEnabled && (
        <ListItem path="/setting" name={t("header_settings")} location={location} history={history} icon="cog" />
      )}
      {props.user.data.admin === true && (
        <>
          <ListItem path="/setting/admin" name="Admin" location={location} history={history} icon="user outline" />
          <ListItem
            path="/setting/term"
            name="terms"
            location={location}
            history={history}
            icon="pencil"
            t={t}
            hasTranslation
          />
        </>
      )}

      <ListItem
        path="/setting/about"
        name="about"
        location={location}
        history={history}
        icon="info"
        t={t}
        hasTranslation
      />
    </div>
  );
};

MenuSettings.propTypes = {
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
  t: PropTypes.func,
};

const mapStateToProps = state => {
  return {
    setting: state.setting,
    user: state.core_user,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    dispatch: dispatch,
    boreholeSelected: () => {
      dispatch({
        path: "/borehole",
        type: "CLEAR",
      });
    },
  };
};

const ConnectedMenuSettings = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(withTranslation(["common"])(MenuSettings)),
);
export default ConnectedMenuSettings;
