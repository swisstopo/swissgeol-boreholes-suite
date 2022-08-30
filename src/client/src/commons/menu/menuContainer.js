import React from 'react';
import PropTypes from 'prop-types';
import {
  withRouter
} from 'react-router-dom';
import MenuComponent from './menuComponent';

class MenuContainer extends React.Component {
  render() {
    const {
      history,
      location
    } = this.props;
    return (
      <MenuComponent
        handleModeChange={(mode) => {
          if (mode === 'editor') {
            history.push(
              `${process.env.PUBLIC_URL}/editor`
            );
          } else if (mode === 'viewer') {
            history.push(
              process.env.PUBLIC_URL
            );
          } else if (mode.indexOf('setting') >= 0) {
            history.push(
              `${process.env.PUBLIC_URL}/${mode}`
            );
          }
        }}
        mode={(() => {
          if (location.pathname.indexOf('setting/') >= 0) {
            return 'setting';
          } else if (location.pathname.indexOf('editor') >= 0) {
            return 'editor';
          } else {
            return 'viewer';
          }
        })()}
      >
        {this.props.children}
      </MenuComponent>
    );
  }
}

MenuContainer.propTypes = {
  children: PropTypes.node,
  history: PropTypes.shape({
    push: PropTypes.func,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
  }).isRequired,
};

export default withRouter(MenuContainer);
