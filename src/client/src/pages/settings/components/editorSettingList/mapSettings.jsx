import { useContext, useEffect, useState } from "react";
import Highlighter from "react-highlight-words";
import { useTranslation } from "react-i18next";
import { Box, Button, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
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
  const [mapSettings, setMapSettings] = useState(setting.data.map.explorer);

  useEffect(() => {
    setMapSettings(setting.data.map.explorer);
  }, [setting.data.map.explorer]);

  function getIconButton(layer, layerType) {
    return (
      <IconButton
        size="small"
        data-cy="add-layer-button"
        onClick={e => {
          e.stopPropagation();
          const identifier = layerType === "WMS" ? layer.Name : layer.Identifier;
          if (_.has(mapSettings, identifier)) {
            layer.Identifier = identifier;
            rmExplorerMap(layer);
          } else {
            const service = layerType === "WMS" ? state.wms : state.wmts;
            addExplorerMap(layer, layerType, service, _.values(mapSettings).length);
          }
        }}
        color={_.has(mapSettings, layer.Name) ? "error" : "primary"}>
        {_.has(mapSettings, layer.Name) ? <Trash2 /> : <Plus />}
      </IconButton>
    );
  }

  function getLayerList(layers, search, layerType) {
    return layers.map((layer, idx) => {
      const identifier = layerType === "WMS" ? layer.Name : layer.Identifier;

      return search === "" ||
        (Object.prototype.hasOwnProperty.call(layer, "Title") && layer.Title.toLowerCase().search(search) >= 0) ||
        (Object.prototype.hasOwnProperty.call(layer, "Abstract") && layer.Abstract.toLowerCase().search(search) >= 0) ||
        (Object.prototype.hasOwnProperty.call(layer, "Name") && identifier.toLowerCase().search(search) >= 0) ? (
        <div
          className="selectable unselectable"
          key={`${layerType.toLowerCase()}-list-${idx}`}
          style={{
            padding: "0.5em",
          }}>
          <Stack
            data-cy={`${layerType.toLowerCase()}-list-box`}
            direction="row"
            alignItems="center"
            sx={{
              fontWeight: "bold",
            }}>
            <div
              style={{
                flex: 1,
              }}>
              <Highlighter searchWords={[search]} textToHighlight={layer.Title} />
            </div>
            <div>{getIconButton(layer, layerType)}</div>
          </Stack>
          <div
            style={{
              color: "#787878",
              fontSize: "0.8em",
            }}>
            {layer.queryable === true && layerType === "WMS" ? (
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
            <Highlighter searchWords={[search]} textToHighlight={identifier} />
          </div>
          <div
            style={{
              fontSize: "0.8em",
            }}>
            <Highlighter searchWords={[search]} textToHighlight={layer.Abstract} />
          </div>
        </div>
      ) : null;
    });
  }

  function fetchCapabilitiesForService() {
    const isWms = setting.selectedWMS.startsWith("https://wms");
    const languageParam = `${isWms ? "&lang=" : "?lang="}${i18n.language}`;
    fetch(setting.selectedWMS + languageParam).then(response => {
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
          showAlert(t("onlyWmsAndWmtsSupported"), "error");
        }
      });
    });
  }

  const filterBySearchTerm = (layer, search) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      (layer.Title && layer.Title.toLowerCase().includes(searchLower)) ||
      (layer.Abstract && layer.Abstract.toLowerCase().includes(searchLower)) ||
      (layer.Identifier && layer.Identifier.toLowerCase().includes(searchLower))
    );
  };

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
        <Typography variant="body1"> {t("map")}</Typography>
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
          <Box sx={{ overFlowY: "auto" }}>
            <Stack direction={{ xs: "column", sm: "column", md: "row" }} gap={1} sx={{ p: 1 }}>
              <Box sx={{ flex: "1 1 0" }}>
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
                    sx={{ height: "37px", width: "80px", ml: 1 }}
                    variant="contained"
                    data-cy="load-layers-button"
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
                  {state.wms &&
                    getLayerList(
                      state.wms.Capability.Layer.Layer.sort((a, b) => a.Name.localeCompare(b.Name)),
                      state.searchWms,
                      "WMS",
                    )}
                  {state.wmts &&
                    getLayerList(
                      state.wmts.Contents.Layer.sort((a, b) => a.Identifier.localeCompare(b.Identifier)),
                      state.searchWmts,
                      "WMTS",
                    )}
                </div>
              </Box>
              <Box sx={{ ml: 3, flex: "1 1 0" }}>
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
                  {mapSettings &&
                    Object.entries(mapSettings).map(([key, layer], index) => {
                      return filterBySearchTerm(layer, state.searchWmtsUser) ? (
                        <div
                          className="selectable unselectable"
                          key={"wmts-list-" + index}
                          style={{
                            padding: "0.5em",
                          }}>
                          <Stack
                            data-cy="maps-for-user-box"
                            direction="row"
                            alignItems="center"
                            sx={{
                              fontWeight: "bold",
                            }}>
                            <div
                              style={{
                                flex: 1,
                              }}>
                              <Highlighter searchWords={[state.searchWmtsUser]} textToHighlight={layer.Title} />
                            </div>
                            <div>
                              <IconButton
                                data-cy="delete-user-map-button"
                                onClick={e => {
                                  e.stopPropagation();
                                  if (_.has(mapSettings, key)) {
                                    layer.Identifier = key;
                                    rmExplorerMap(layer);
                                  }
                                }}
                                color="error">
                                <Trash2 />
                              </IconButton>
                            </div>
                          </Stack>
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
                      ) : null;
                    })}
                </div>
              </Box>
            </Stack>
          </Box>
        </Segment.Group>
      ) : (
        <Divider style={{ margin: 0 }} />
      )}
    </>
  );
};

export default MapSettings;
