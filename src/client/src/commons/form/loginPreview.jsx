import React from "react";
import PropTypes from "prop-types";
import { Button } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";

class LoginPreview extends React.Component {
  render() {
    return (
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "2px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
          display: "flex",
          flexDirection: "row",
          padding: "2em",
        }}>
        <div
          style={{
            width: "300px",
            paddingRight: "1em",
          }}>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
            }}>
            <img
              alt="Swiss Logo"
              src={import.meta.env.PUBLIC_URL + "/logo.svg"}
              style={{
                height: "100px",
              }}
            />
            <div
              style={{
                marginLeft: "1em",
                textAlign: "left",
              }}>
              <div>
                <div
                  style={{
                    fontSize: "1.2em",
                  }}>
                  {this.props.title}
                </div>
                <div
                  style={{
                    fontSize: "0.8em",
                  }}>
                  Borehole Data Management System
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: "2em",
            }}>
            <Markdown>{this.props.body}</Markdown>
          </div>
        </div>

        <div
          style={{
            width: "300px",
            padding: "0px 1em 0px 2em",
          }}>
          <div
            style={{
              fontSize: "1.2em",
              paddingBottom: "2em",
              textAlign: "center",
            }}>
            Sign in
          </div>
          <Button
            compact
            content="Login"
            fluid
            primary
            size="small"
            style={{
              marginTop: "1.5em",
            }}
          />
        </div>
      </div>
    );
  }
}

LoginPreview.propTypes = {
  body: PropTypes.string,
  title: PropTypes.string,
};

LoginPreview.defaultProps = {
  title: "Welcome to swissforage.ch",
  body: "",
};

export default LoginPreview;
