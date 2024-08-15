import React from "react";
import { withTranslation } from "react-i18next";
import { Header } from "semantic-ui-react";

class AboutSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      license: [],
    };
  }

  async componentDidMount() {
    const response = await fetch("/license.json");

    this.setState({
      license: await response.json(),
    });
  }

  render() {
    const { t } = this.props;
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
          {t("common:about")}
        </Header>
        <div
          style={{
            display: "flex",
          }}>
          <span
            style={{
              fontWeight: "bold",
            }}>
            {t("sourceCode")}
            :&nbsp;
          </span>
          <span>
            <a href="https://github.com/geoadmin/suite-bdms" rel="noopener noreferrer" target="_BLANK">
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
            {t("version")}
            :&nbsp;
          </span>
          <span>
            <a
              href={
                "https://github.com/geoadmin/suite-bdms/releases/tag/v" + import.meta.env.VITE_APP_VERSION.split("+")[0]
              }
              rel="noopener noreferrer"
              target="_BLANK"
              data-cy="version">
              {import.meta.env.VITE_APP_VERSION}
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
            {t("version")}
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
        <Header
          as="h3"
          style={{
            margin: "0px",
            textDecoration: "none",
            paddingTop: "2em",
          }}>
          {t("common:licenseInformation")}
        </Header>
        {Object.keys(this.state.license).map(key => (
          <div key={key} data-cy={"credits-" + key}>
            <h4
              style={{
                paddingTop: "1em",
              }}>
              {this.state.license[key].name}
              {this.state.license[key].version && ` (Version ${this.state.license[key].version})`}{" "}
            </h4>
            <span>
              <a href={this.state.license[key].repository}>{this.state.license[key].repository}</a>
            </span>
            <div>{this.state.license[key].description}</div>
            <div>{this.state.license[key].copyright}</div>
            <div>License: {this.state.license[key].licenses}</div>
            <div>{this.state.license[key].licenseText}</div>
          </div>
        ))}
      </div>
    );
  }
}

const AboutSettingsWithTranslation = withTranslation(["common"])(AboutSettings);
export default AboutSettingsWithTranslation;
