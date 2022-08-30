import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import ListItem from '../components/listItem';

const MenuSettings = props => {
  const { history, t, location } = props;

  return (
    <div>
      <ListItem
        path="/"
        name="done"
        location={location}
        history={history}
        icon="arrow left"
        t={t}
        hasTranslation
      />
      <ListItem
        path="/setting/explorer"
        name="Viewer"
        location={location}
        history={history}
        icon="binoculars"
      />

      {props.user.data !== null && props.user.data.roles.indexOf('EDIT') >= 0 && (
        <>
          <ListItem
            path="/setting/editor"
            name="Editor"
            location={location}
            history={history}
            icon="edit"
          />
        </>
      )}

      {props.user.data.admin === true && (
        <>
          <ListItem
            path="/setting/admin"
            name="Admin"
            location={location}
            history={history}
            icon="user outline"
          />
          <ListItem
            path="/setting/term"
            name="terms"
            location={location}
            history={history}
            icon="pencil"
            t={t}
            hasTranslation
          />
          <ListItem
            path="/setting/login"
            name="loginScreen"
            location={location}
            history={history}
            icon="sign-in"
            t={t}
            hasTranslation
          />
        </>
      )}

      {props.user.data !== null && props.user.data.admin === true && (
        <>
          <ListItem
            path="/setting/database"
            name="Database"
            location={location}
            history={history}
            icon="database"
          />
        </>
      )}
      <ListItem
        path="/setting/resources"
        name="resources"
        location={location}
        history={history}
        icon="linkify"
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
    boreholeSelected: borehole => {
      dispatch({
        path: '/borehole',
        type: 'CLEAR',
      });
    },
  };
};

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps,
  )(withTranslation(['common'])(MenuSettings)),
);
