import React, { createRef } from "react";
import PropTypes from "prop-types";
import { Button, Input } from "semantic-ui-react";
import Markdown from "markdown-to-jsx";

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.fieldToRef = createRef();
  }

  componentDidMount() {
    // if (process.env.NODE_ENV === 'development'){
    //   this.props.setAuthentication('admin', 'swissforages');
    // } else {
    //   this.props.setAuthentication('', '');
    // }
    this.fieldToRef.current.focus();
  }

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
              src={process.env.PUBLIC_URL + "/logo.svg"}
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
          {/* <div
            style={{
              paddingTop: '1em'
            }}
          >
            For any use of swissforages.ch please respect the disclaimer of
            the Swiss Confederation and in particular the disclaimer
            (LINK to DISCLAIMER) of swissforages.ch.
          </div> */}
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
          {/** Trick to disable autofill in chrome */}
          <input
            name="password"
            style={{
              display: "none",
            }}
            type="password"
          />
          <div
            style={{
              fontSize: "0.8em",
              paddingBottom: "4px",
            }}>
            Username
          </div>
          <Input
            autoComplete="off"
            fluid
            onChange={e => {
              // this.props.setAuthentication(
              //   e.target.value,
              //   this.props.user.authentication !== null?
              //     this.props.user.authentication.password: ''
              // );
            }}
            onKeyPress={e => {
              // if (e.key === 'Enter'){
              //   this.props.loadUser();
              // }
            }}
            placeholder="username"
            ref={this.fieldToRef}
            value={
              this.props.user.authentication !== null
                ? this.props.user.authentication.username
                : ""
            }
          />

          <div
            style={{
              fontSize: "0.8em",
              padding: "8px 0px 4px 0px",
            }}>
            Password
          </div>
          <Input
            autoComplete="off"
            fluid
            onChange={e => {
              // this.props.setAuthentication(
              //   this.props.user.authentication !== null?
              //     this.props.user.authentication.username: '',
              //   e.target.value
              // );
            }}
            onKeyPress={e => {
              // if (e.key === 'Enter'){
              //   this.props.loadUser();
              // }
            }}
            placeholder="password"
            type="password"
            value={
              this.props.user.authentication !== null
                ? this.props.user.authentication.password
                : ""
            }
          />
          <Button
            color={this.props.user.data !== null ? "green" : null}
            compact
            content="Login"
            fluid
            loading={this.props.user.data !== null}
            onClick={() => {
              // this.props.onGuestLogin();
            }}
            primary={this.props.user.data === null}
            size="small"
            style={{
              marginTop: "1.5em",
            }}
          />
          <div
            style={{
              color: "red",
              fontSize: "0.8em",
            }}>
            {this.props.user.error === false ? (
              <span>&nbsp;</span>
            ) : (
              "User or password wrong"
            )}
          </div>
          {this.props.guest === true ? (
            <Button
              compact
              content="Enter as viewer"
              disabled={this.props.user.data !== null}
              fluid
              onClick={() => {
                if (this.props.onGuestLogin) {
                  this.props.onGuestLogin("guest", "MeiSe0we1Oowief");
                }
              }}
              secondary
              size="small"
            />
          ) : null}
        </div>
      </div>
    );
  }
}

Login.propTypes = {
  body: PropTypes.string,
  guest: PropTypes.bool,
  onGuestLogin: PropTypes.func,
  // onLogin: PropTypes.func,
  // t: PropTypes.func,
  title: PropTypes.string,
  user: PropTypes.shape({
    authentication: PropTypes.shape({
      password: PropTypes.string,
      username: PropTypes.string,
    }),
    data: PropTypes.object,
    error: PropTypes.bool,
  }),
};

Login.defaultProps = {
  guest: true,
  title: "Welcome to swissforage.ch",
  body: "",
};

export default Login; //withTranslation()(Login);
