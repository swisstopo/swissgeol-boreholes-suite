import React from "react";
import PropTypes from "prop-types";
import { withRouter } from "react-router-dom";
import MenuComponent from "./menuComponent";

class MenuContainer extends React.Component {
  render() {
    const { history } = this.props;
    return (
      <MenuComponent
        handleModeChange={mode => {
          if (mode === "editor") {
            history.push(`/editor`);
          } else if (mode.indexOf("setting") >= 0) {
            history.push(`/${mode}`);
          }
        }}>
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
};

const MenuContainerWithRouter = withRouter(MenuContainer);

export default MenuContainerWithRouter;
