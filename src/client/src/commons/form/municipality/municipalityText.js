import React from "react";
import PropTypes from "prop-types";
import _ from "lodash";

import { getMunicipality } from "../../../api-lib/index";

class MunicipalityText extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      municipality: null,
      id: this.props.id,
    };
  }

  componentDidMount() {
    const { municipality, id } = this.state;
    if (_.isNil(municipality) && !_.isNil(id)) {
      getMunicipality(id).then(
        function (response) {
          if (response.data.success) {
            this.setState({
              municipality: response.data.data,
            });
          } else {
            this.setState({
              municipality: null,
            });
          }
        }.bind(this),
      );
    }
  }

  render() {
    const { municipality } = this.state;
    if (_.isNil(municipality)) return "-";
    return municipality.name;
  }
}

MunicipalityText.propTypes = {
  id: PropTypes.number,
};

export default MunicipalityText;
