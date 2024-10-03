import { useContext } from "react";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { Button, CircularProgress, IconButton } from "@mui/material";
import { Divider, Dropdown, Input, Label, Popup, Segment } from "semantic-ui-react";
import { Plus, Trash2 } from "lucide-react";
import _ from "lodash";
import WMSCapabilities from "ol/format/WMSCapabilities";
import WMTSCapabilities from "ol/format/WMTSCapabilities";
import { theme } from "../../../../AppTheme";
import { AlertContext } from "../../../../components/alert/alertContext";

const MapSettings = props => {
  const { showAlert } = useContext(AlertContext);
  const { setting, i18n, rmExplorerMap, addExplorerMap, handleAddItem, handleOnChange, state, setState } = props;
  const { t } = useTranslation();

  function getIconButton(layer, layerType) {
    return (
      <IconButton
        size="small"
        onClick={e => {
          e.stopPropagation();
          if (_.has(setting.data.map.explorer, layerType === "WMS" ? layer.Name : layer.identifier)) {
            rmExplorerMap(layer);
          } else {
            const service = layerType === "WMS" ? state.wms : state.wmts;
            addExplorerMap(layer, layerType, service, _.values(setting.data.map.explorer).length);
          }
        }}
        color={_.has(setting.data.map.explorer, layer.Name) ? "error" : "primary"}>
        {_.has(setting.data.map.explorer, layer.Name) ? <Trash2 /> : <Plus />}
      </IconButton>
    );
  }

  function getWmsList() {
    return state.wms.Capability.Layer.Layer.map((layer, idx) =>
      state.searchWms === "" ||
      (Object.prototype.hasOwnProperty.call(layer, "Title") &&
        layer.Title.toLowerCase().search(state.searchWms) >= 0) ||
      (Object.prototype.hasOwnProperty.call(layer, "Abstract") &&
        layer.Abstract.toLowerCase().search(state.searchWms) >= 0) ||
      (Object.prototype.hasOwnProperty.call(layer, "Name") && layer.Name.toLowerCase().search(state.searchWms) >= 0) ? (
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
            <div>{getIconButton(layer, "WMS")}</div>
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
    );
  }

  function getWmtsList() {
    console.log(state.wmts);
    return state.wmts.Contents.Layer.map((layer, idx) => {
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
            <div>{getIconButton(layer, "WMTS")}</div>
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
    });
  }

  function fetchCapabilitiesForService() {
    fetch(setting.selectedWMS).then(response => {
      response.text().then(data => {
        // Check if WMS or WMTS
        if (/<(WMT_MS_Capabilities|WMS_Capabilities)/.test(data)) {
          const wms = new WMSCapabilities().read(data);
          setState({
            ...state,
            wmsFetch: false,
            wms: wms,
            wmts: null,
          });
        } else if (/<Capabilities/.test(data)) {
          const wmts = new WMTSCapabilities().read(data);
          setState({
            ...state,

            wmsFetch: false,
            wms: null,
            wmts: wmts,
          });
        } else {
          setState({
            ...state,

            wmsFetch: false,
            wms: null,
            wmts: null,
          });
          showAlert("Sorry, only Web Map Services (WMS) and " + "Web Map Tile Service (WMTS) are supported", "error");
        }
      });
    });
  }

  return (
    <>
      <div
        onClick={() => {
          setState({
            ...state,
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
          <Button variant="outlined">{state.map ? t("collapse") : t("expand")}</Button>
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
                    sx={{ height: "37px", width: "80px" }}
                    variant="contained"
                    onClick={() => {
                      setState({
                        ...state,
                        wmsFetch: true,
                        wms: null,
                        wmts: null,
                      });
                      fetchCapabilitiesForService();
                    }}>
                    {state.wmsFetch ? <CircularProgress size={22} color="inherit" /> : t("load")}
                  </Button>
                </div>
                {state.wmts !== null ? (
                  <div>
                    <Input
                      icon="search"
                      onChange={e => {
                        setState({
                          ...state,
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
                          ...state,
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
                  {state.wms === null ? null : getWmsList()}
                  {state.wmts === null ? null : getWmtsList()}
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
                          ...state,
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
                              <IconButton
                                onClick={e => {
                                  e.stopPropagation();
                                  if (_.has(setting.data.map.explorer, layer.Identifier)) {
                                    rmExplorerMap(layer);
                                  }
                                }}
                                color="error">
                                <Trash2 />
                              </IconButton>
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
