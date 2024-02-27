import React from "react";
import PropTypes from "prop-types";
import { Dropdown, Icon, Tab, Menu } from "semantic-ui-react";
import DateText from "../../form/dateText";
import ProfileContainer from "./profile/profileContainer";
import MetaComponent from "./../meta/metaComponent";
import TranslationText from "../../form/translationText";

import BoreholeFilesTable from "../../files/table/boreholeFilesTable";

class StratigraphiesComponent extends React.Component {
  constructor(props) {
    super(props);
    let primary =
      props.data.borehole.stratigraphy !== null
        ? props.data.borehole.stratigraphy.findIndex(
            item => item.primary === true,
          )
        : -1;
    this.state = {
      index: primary,
    };
  }

  render() {
    const { data } = this.props;
    const item =
      data.borehole.stratigraphy !== null &&
      data.borehole.stratigraphy.length > 0
        ? data.borehole.stratigraphy[
            this.state.index >= 0 ? this.state.index : 0
          ]
        : null;
    const tmp = [
      {
        menuItem: (
          <Menu.Item
            key={"str-tb-data"}
            style={{
              color: "#2185d0",
            }}>
            <div>
              <TranslationText id="borehole" />
              <br />
              <span
                style={{
                  fontSize: "0.7em",
                }}>
                <TranslationText id="details" />
              </span>
            </div>
          </Menu.Item>
        ),
        render: () => (
          <div
            style={{
              overflowY: "auto",
              height: "100%",
              border: "1px solid #D4D4D5",
              borderTop: "none",
              padding: "1em",
            }}>
            <MetaComponent data={data.borehole} />
          </div>
        ),
      },
      {
        menuItem: (
          <Menu.Item key={"str-tb-attachments"}>
            <div>
              <TranslationText id="attachments" />
              <br />
              <span
                style={{
                  fontSize: "0.7em",
                }}>
                {data.borehole.attachments} Files
              </span>
            </div>
          </Menu.Item>
        ),
        render: () => (
          <div
            style={{
              // flexGrow: 1,
              overflowY: "auto",
              height: "100%",
              border: "1px solid #D4D4D5",
              borderTop: "none",
              padding: "1em",
            }}>
            {data.borehole.attachments === 0 ? (
              "Empty"
            ) : (
              <BoreholeFilesTable id={data.borehole.id} />
            )}
          </div>
        ),
      },
      item !== null
        ? {
            menuItem: (
              <Menu.Item key={"str-tb-2"}>
                <div>
                  {item.primary === true ? (
                    <Icon name="check" size="small" title="Primary" />
                  ) : null}
                  {item.name === null || item.name === "" ? (
                    <TranslationText id="np" />
                  ) : (
                    item.name
                  )}
                  {data.borehole.stratigraphy.length <= 1 ? null : (
                    <Dropdown
                      icon={null}
                      onChange={(ev, data) => {
                        this.setState({
                          index: data.value,
                        });
                      }}
                      options={data.borehole.stratigraphy.map(
                        (ditem, idx2) => ({
                          value: idx2,
                          selected: ditem.id === item.id,
                          text: (
                            <div>
                              {ditem.primary === true ? (
                                <Icon
                                  name="check"
                                  size="mini"
                                  style={{
                                    margin: "0em 0.25rem 0em 0em",
                                  }}
                                  title="Primary"
                                />
                              ) : null}
                              {ditem.name === null || ditem.name === "" ? (
                                <TranslationText id="np" />
                              ) : (
                                ditem.name
                              )}
                              <br />
                              <span
                                style={{
                                  fontSize: "0.7em",
                                }}>
                                <DateText date={ditem.date} />
                              </span>
                            </div>
                          ),
                        }),
                      )}
                      pointing="top right"
                      trigger={<Icon name="caret down" />}
                    />
                  )}
                  <br />
                  <span
                    style={{
                      fontSize: "0.7em",
                    }}>
                    <DateText date={item.date} />
                  </span>
                </div>
              </Menu.Item>
            ),
            render: () => (
              <div
                style={{
                  overflow: "hidden",
                  height: "100%",
                  border: "1px solid #D4D4D5",
                  borderTop: "none",
                  padding: "1em",
                }}>
                <ProfileContainer id={item.id} />
              </div>
            ),
          }
        : null,
    ];
    return (
      <div
        style={{
          flexGrow: 1,
          overflow: "hidden",
          height: "100%",
          padding: "0px 1em 0px 0.5em",
        }}>
        <Tab
          defaultActiveIndex={item === null ? 0 : 2}
          panes={tmp}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        />
      </div>
    );
  }
}

StratigraphiesComponent.propTypes = {
  data: PropTypes.object,
};

export default StratigraphiesComponent;
