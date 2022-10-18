import React from "react";
import { withTranslation } from "react-i18next";

import { Header } from "semantic-ui-react";

// eslint-disable-next-line react/prefer-stateless-function
class AboutSettings extends React.Component {
  render() {
    return (
      <div
        style={{
          padding: "2em",
          flex: 1,
        }}>
        <Header
          as="h3"
          style={{
            margin: "0px",
            textDecoration: "none",
          }}>
          {this.props.t("common:about")}
        </Header>
        <div
          style={{
            paddingTop: "1em",
          }}>
          Source code:
          <br />
          <a
            href="https://github.com/geoadmin/suite-bdms"
            rel="noopener noreferrer"
            target="_BLANK">
            https://github.com/geoadmin/suite-bdms
          </a>
        </div>
      </div>
    );
  }
}

export default withTranslation(["common"])(AboutSettings);
