import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import _ from 'lodash';

class Scroller extends React.Component {

  constructor(props) {
    super(props);
    this.updateDimensions = this.updateDimensions.bind(this);
    this.state = {
      scroller: false
    };
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener(
      "resize",
      this.updateDimensions,
      { passive: true }
    );
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  updateDimensions() {
    if (!_.isNil(this.cntnr) && this.cntnr.children.length > 0) {
      if (this.props.debug === true) {
        debugger;
      }
      const height = this.cntnr.clientHeight;
      const childrenHeight = this.cntnr.children[0].clientHeight;

      this.setState({
        scroller: childrenHeight > height
      });
    } else {
      this.setState({
        scroller: true
      });
    }
  }

  render() {
    return (
      <div
        className={
          this.state.scroller === true ?
            'scroller' : null
        }
        ref={divElement => this.cntnr = divElement}
        style={{
          overflowY: 'hidden',
          marginRight: this.state.scroller === true ?
            this.props.setting.scrollbar : '0px',
          ...this.props.style
        }}
      >
        {this.props.children}
      </div>
    );
  }
}

Scroller.propTypes = {
  children: PropTypes.node,
  debug: PropTypes.bool,
  setting: PropTypes.shape({
    scrollbar: PropTypes.string
  }),
  style: PropTypes.object
};

Scroller.defaultProps = {
  debug: false
};

const mapStateToProps = (state) => {
  return {
    setting: state.setting
  };
};

export default connect(
  mapStateToProps,
  null
)(Scroller);
