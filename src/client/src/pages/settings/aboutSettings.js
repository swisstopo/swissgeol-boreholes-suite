import React from "react";
import { withTranslation } from "react-i18next";
import TranslationText from "../../commons/form/translationText";
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
            paddingBottom: "1em",
          }}>
          {this.props.t("common:about")}
        </Header>
        <div
          style={{
            display: "flex",
          }}>
          <span
            style={{
              fontWeight: "bold",
            }}>
            <TranslationText id="sourceCode" />
            :&nbsp;
          </span>
          <span>
            <a
              href="https://github.com/geoadmin/suite-bdms"
              rel="noopener noreferrer"
              target="_BLANK">
              github.com/geoadmin/suite-bdms
            </a>
          </span>
        </div>
        <div
          style={{
            display: "flex",
          }}>
          <span
            style={{
              fontWeight: "bold",
            }}>
            <TranslationText id="version" />
            :&nbsp;
          </span>
          <span>
            <a
              href={
                "https://github.com/geoadmin/suite-bdms/releases/tag/v" +
                process.env.REACT_APP_VERSION.split("+")[0]
              }
              rel="noopener noreferrer"
              target="_BLANK">
              {process.env.REACT_APP_VERSION}
            </a>
          </span>
        </div>
        <div
          style={{
            display: "flex",
          }}>
          <span
            style={{
              fontWeight: "bold",
            }}>
            <TranslationText id="license" />
            :&nbsp;
          </span>
          <span>
            <a
              href="https://github.com/geoadmin/suite-bdms/blob/main/LICENSE"
              rel="noopener noreferrer"
              target="_BLANK">
              MIT
            </a>
          </span>
        </div>
      </div>
    );
  }
}

export default withTranslation(["common"])(AboutSettings);
