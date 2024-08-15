import { useContext } from "react";
import _ from "lodash";
import Highlighter from "react-highlight-words";

import { Button, Divider, Dropdown, Input, Label, Popup, Segment } from "semantic-ui-react";
import { getWms } from "../../../../api-lib/index";
import { AlertContext } from "../../../../components/alert/alertContext";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import WMSCapabilities from "ol/format/WMSCapabilities";
import { theme } from "../../../../AppTheme";
import { useTranslation } from "react-i18next";

const MapSettings = props => {
  const { showAlert } = useContext(AlertContext);
  const { setting, i18n, rmExplorerMap, addExplorerMap, handleAddItem, handleOnChange, state, setState } = props;
  const { t } = useTranslation();

  return (
    <>
      <div
        onClick={() => {
          setState({
            map: !state.map,
          });
        }}
        style={{
          flexDirection: "row",
          display: "flex",
          cursor: "pointer",
          backgroundColor: state.map ? theme.palette.background.lightgrey : theme.palette.background.default,
          padding: 10,
        }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 18,
            fontWeight: "bold",
          }}>
          {t("map")}
        </div>
        <div
          style={{
            flex: 1,
            textAlign: "right",
          }}>
          <Button color="red" size="small">
            {state.map === true ? t("collapse") : t("expand")}
          </Button>
        </div>
      </div>
      {state.map === true ? (
        <Segment.Group style={{ margin: 0 }}>
          <Segment>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
              }}>
              <div
                style={{
                  flex: "1 1 100%",
                }}>
                <div
                  style={{
                    alignItems: "center",
                    marginBottom: "1em",
                    display: "flex",
                    flexDirection: "row",
                  }}>
                  <div
                    style={{
                      flex: 1,
                    }}>
                    <Dropdown
                      additionLabel=""
                      allowAdditions
                      fluid
                      onAddItem={(e, { value }) => {
                        handleAddItem(value);
                      }}
                      onChange={(e, { value }) => {
                        handleOnChange(value);
                      }}
                      options={setting.WMS}
                      placeholder=""
                      search
                      selection
                      value={setting.selectedWMS}
                    />
                  </div>
                  <Button
                    compact
                    loading={state.wmsFetch === true}
                    onClick={() => {
                      setState(
                        {
                          wmsFetch: true,
                          wms: null,
                          wmts: null,
                        },
                        () => {
                          getWms(i18n.language, setting.selectedWMS).then(response => {
                            // Check if WMS or WMTS
                            let data = response.data;
                            if (/<(WMT_MS_Capabilities|WMS_Capabilities)/.test(data)) {
                              const wms = new WMSCapabilities().read(data);
                              setState({
                                wmsFetch: false,
                                wms: wms,
                                wmts: null,
                              });
                            } else if (/<Capabilities/.test(data)) {
                              const wmts = new WMTSCapabilities().read(data);
                              setState({
                                wmsFetch: false,
                                wms: null,
                                wmts: wmts,
                              });
                            } else {
                              setState({
                                wmsFetch: false,
                                wms: null,
                                wmts: null,
                              });
                              showAlert(
                                "Sorry, only Web Map Services (WMS) and " + "Web Map Tile Service (WMTS) are supported",
                                "error",
                              );
                            }
                          });
                        },
                      );
                    }}
                    secondary
                    style={{
                      marginLeft: "1em",
                    }}
                    // size='mini'
                  >
                    {t("load")}
                  </Button>
                </div>
                {state.wmts !== null ? (
                  <div>
                    <Input
                      icon="search"
                      onChange={e => {
                        setState({
                          searchWmts: e.target.value.toLowerCase(),
                        });
                      }}
                      placeholder="Search..."
                    />
                  </div>
                ) : null}
                {state.wms !== null ? (
                  <div>
                    <Input
                      icon="search"
                      onChange={e => {
                        setState({
                          searchWms: e.target.value.toLowerCase(),
                        });
                      }}
                      placeholder="Search..."
                    />
                  </div>
                ) : null}
                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    border: state.wms === null && state.wmts === null ? null : "thin solid #cecece",
                    marginTop: state.wms === null && state.wmts === null ? null : "1em",
                  }}>
                  {state.wms === null
                    ? null
                    : state.wms.Capability.Layer.Layer.map((layer, idx) =>
                        state.searchWms === "" ||
                        (Object.prototype.hasOwnProperty.call(layer, "Title") &&
                          layer.Title.toLowerCase().search(state.searchWms) >= 0) ||
                        (Object.prototype.hasOwnProperty.call(layer, "Abstract") &&
                          layer.Abstract.toLowerCase().search(state.searchWms) >= 0) ||
                        (Object.prototype.hasOwnProperty.call(layer, "Name") &&
                          layer.Name.toLowerCase().search(state.searchWms) >= 0) ? (
                          <div
                            className="selectable unselectable"
                            key={"wmts-list-" + idx}
                            style={{
                              padding: "0.5em",
                            }}>
                            <div
                              style={{
                                fontWeight: "bold",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}>
                              <div
                                style={{
                                  flex: 1,
                                }}>
                                <Highlighter searchWords={[state.searchWms]} textToHighlight={layer.Title} />
                              </div>
                              <div>
                                <Button
                                  color={_.has(setting.data.map.explorer, layer.Name) ? "grey" : "blue"}
                                  icon={
                                    _.has(setting.data.map.explorer, layer.Name) ? "trash alternate outline" : "add"
                                  }
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (_.has(setting.data.map.explorer, layer.Name)) {
                                      rmExplorerMap(layer);
                                    } else {
                                      addExplorerMap(
                                        layer,
                                        "WMS",
                                        state.wms,
                                        _.values(setting.data.map.explorer).length,
                                      );
                                    }
                                  }}
                                  size="mini"
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                color: "#787878",
                                fontSize: "0.8em",
                              }}>
                              {layer.queryable === true ? (
                                <Popup
                                  content="Queryable"
                                  on="hover"
                                  trigger={
                                    <Label
                                      circular
                                      color="green"
                                      empty
                                      size="tiny"
                                      style={{
                                        marginRight: "0.5em",
                                      }}
                                    />
                                  }
                                />
                              ) : null}
                              <Highlighter searchWords={[state.searchWms]} textToHighlight={layer.Name} />
                            </div>
                            <div
                              style={{
                                fontSize: "0.8em",
                              }}>
                              <Highlighter searchWords={[state.searchWms]} textToHighlight={layer.Abstract} />
                            </div>
                          </div>
                        ) : null,
                      )}
                  {state.wmts === null
                    ? null
                    : state.wmts.Contents.Layer.map((layer, idx) => {
                        return state.searchWmts === "" ||
                          (Object.prototype.hasOwnProperty.call(layer, "Title") &&
                            layer.Title.toLowerCase().search(state.searchWmts) >= 0) ||
                          (Object.prototype.hasOwnProperty.call(layer, "Abstract") &&
                            layer.Abstract.toLowerCase().search(state.searchWmts) >= 0) ||
                          (Object.prototype.hasOwnProperty.call(layer, "Identifier") &&
                            layer.Identifier.toLowerCase().search(state.searchWmts) >= 0) ? (
                          <div
                            className="selectable unselectable"
                            key={"wmts-list-" + idx}
                            style={{
                              padding: "0.5em",
                            }}>
                            <div
                              style={{
                                fontWeight: "bold",
                                display: "flex",
                                flexDirection: "row",
                                alignItems: "center",
                              }}>
                              <div
                                style={{
                                  flex: 1,
                                }}>
                                <Highlighter searchWords={[state.searchWmts]} textToHighlight={layer.Title} />
                              </div>
                              <div>
                                <Button
                                  color={_.has(setting.data.map.explorer, layer.Identifier) ? "grey" : "blue"}
                                  icon={
                                    _.has(setting.data.map.explorer, layer.Identifier)
                                      ? "trash alternate outline"
                                      : "add"
                                  }
                                  onClick={e => {
                                    e.stopPropagation();
                                    if (_.has(setting.data.map.explorer, layer.Identifier)) {
                                      rmExplorerMap(layer);
                                    } else {
                                      addExplorerMap(
                                        layer,
                                        "WMTS",
                                        state.wmts,
                                        _.values(setting.data.map.explorer).length,
                                      );
                                    }
                                  }}
                                  size="mini"
                                />
                              </div>
                            </div>
                            <div
                              style={{
                                color: "#787878",
                                fontSize: "0.8em",
                              }}>
                              <Highlighter searchWords={[state.searchWmts]} textToHighlight={layer.Identifier} />
                            </div>
                            <div
                              style={{
                                fontSize: "0.8em",
                              }}>
                              <Highlighter searchWords={[state.searchWmts]} textToHighlight={layer.Abstract} />
                            </div>
                          </div>
                        ) : null;
                      })}
                </div>
              </div>
              <div
                style={{
                  flex: "1 1 100%",
                  marginLeft: "1em",
                }}>
                <div
                  style={{
                    alignItems: "center",
                    marginBottom: "1em",
                    display: "flex",
                    flexDirection: "row",
                  }}>
                  <div
                    style={{
                      flex: 1,
                    }}>
                    {t("usersMap")}
                  </div>
                  <div>
                    <Input
                      icon="search"
                      onChange={e => {
                        setState({
                          searchWmtsUser: e.target.value.toLowerCase(),
                        });
                      }}
                      placeholder="Search..."
                    />
                  </div>
                </div>
                <div
                  style={{
                    maxHeight: "300px",
                    overflowY: "auto",
                    flex: "1 1 100%",
                    border: "thin solid #cecece",
                  }}>
                  {_.values(setting.data.map.explorer)
                    .sort((a, b) => {
                      if (a.position < b.position) {
                        return 1;
                      } else if (a.position > b.position) {
                        return -1;
                      }
                      return 0;
                    })
                    .map((layer, idx) =>
                      state.searchWmtsUser === "" ||
                      (Object.prototype.hasOwnProperty.call(layer, "Title") &&
                        layer.Title.toLowerCase().search(state.searchWmtsUser) >= 0) ||
                      (Object.prototype.hasOwnProperty.call(layer, "Abstract") &&
                        layer.Abstract.toLowerCase().search(state.searchWmtsUser) >= 0) ||
                      (Object.prototype.hasOwnProperty.call(layer, "Identifier") &&
                        layer.Identifier.toLowerCase().search(state.searchWmtsUser) >= 0) ? (
                        <div
                          className="selectable unselectable"
                          key={"wmts-list-" + idx}
                          style={{
                            padding: "0.5em",
                          }}>
                          <div
                            style={{
                              fontWeight: "bold",
                              display: "flex",
                              flexDirection: "row",
                              alignItems: "center",
                            }}>
                            <div
                              style={{
                                flex: 1,
                              }}>
                              <Highlighter searchWords={[state.searchWmtsUser]} textToHighlight={layer.Title} />
                            </div>
                            <div>
                              <Button
                                color="grey"
                                icon="trash alternate outline"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (_.has(setting.data.map.explorer, layer.Identifier)) {
                                    rmExplorerMap(layer);
                                  }
                                }}
                                size="mini"
                              />
                            </div>
                          </div>
                          <div
                            style={{
                              color: "#787878",
                              fontSize: "0.8em",
                            }}>
                            <Highlighter searchWords={[state.searchWmtsUser]} textToHighlight={layer.Identifier} />
                          </div>
                          <div
                            style={{
                              fontSize: "0.8em",
                            }}>
                            <Highlighter searchWords={[state.searchWmtsUser]} textToHighlight={layer.Abstract} />
                          </div>
                        </div>
                      ) : null,
                    )}
                </div>
              </div>
            </div>
          </Segment>
        </Segment.Group>
      ) : (
        <Divider style={{ margin: 0 }} />
      )}
    </>
  );
};

export default MapSettings;
