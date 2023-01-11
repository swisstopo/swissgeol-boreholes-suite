import React from "react";
import _ from "lodash";

class MunicipalityText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      municipality: this.props.id,
    };
  }

  render() {
    const { municipality } = this.state;
    if (_.isNil(municipality)) return "-";
    return municipality;
  }
}

export default MunicipalityText;
