import { FC, useContext, useEffect, useRef, useState } from "react";
import { Box, Button, Card, Stack, Typography } from "@mui/material";
import { MapPin, MoveVertical } from "lucide-react";
import _ from "lodash";
import { Map, View } from "ol";
import { defaults as defaultControls } from "ol/control";
import Feature, { FeatureLike } from "ol/Feature";
import Point from "ol/geom/Point";
import Draw from "ol/interaction/Draw";
import Modify, { ModifyEvent } from "ol/interaction/Modify";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import { get as getProjection } from "ol/proj";
import VectorSource, { VectorSourceEvent } from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { fetchApiV2Legacy } from "../../api/fetchApiV2.ts";
import { getHeight } from "../../api/height.ts";
import { BasemapContext } from "../basemapSelector/basemapContext.tsx";
import { attributions, crossOrigin, swissExtent, updateBasemap } from "../basemapSelector/basemaps.ts";
import { BasemapSelector } from "../basemapSelector/basemapSelector.tsx";
import MapControls from "../buttons/mapControls.jsx";
import { DataCardButtonContainer } from "../dataCard/dataCard.tsx";
import "./mapProjections.ts";
import { detailMapStyleFunction } from "./mapStyleFunctions.ts";

const SRS = "EPSG:2056";

interface PointComponentProps {
  applyChange?: (
    x: string,
    y: string,
    height: number | null,
    country: string | null,
    canton: string | null,
    municipality: string | null,
  ) => void;
  changefeature?: (point: number[]) => void;
  id?: number;
  isEditable?: boolean;
  highlighted?: number[];
  x?: number | null;
  y?: number | null;
}

interface LocationLookupResult {
  country?: string | null;
  canton?: string | null;
  municipality?: string | null;
}

export const PointComponent: FC<PointComponentProps> = ({
  applyChange,
  changefeature,
  isEditable,
  highlighted,
  x,
  y,
}) => {
  const { currentBasemapName } = useContext(BasemapContext);

  const [point, setPoint] = useState<number[] | null>(null);
  const [height, setHeight] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [canton, setCanton] = useState<string | null>(null);
  const [municipality, setMunicipality] = useState<string | null>(null);
  const [address, setAddress] = useState<boolean>(false);

  const mapRef = useRef<Map | null>(null);
  const positionRef = useRef<VectorSource | null>(null);
  const centerFeatureRef = useRef<Feature | null>(null);
  const drawRef = useRef<Draw | null>(null);
  const modifyRef = useRef<Modify | null>(null);
  const lhRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const displayedBaseMapRef = useRef<string | null>(null);
  const pointRef = useRef<number[] | null>(null);
  const changefeatureRef = useRef(changefeature);
  const highlightedRef = useRef(highlighted);
  useEffect(() => {
    changefeatureRef.current = changefeature;
  }, [changefeature]);
  useEffect(() => {
    highlightedRef.current = highlighted;
  }, [highlighted]);
  useEffect(() => {
    pointRef.current = point;
  }, [point]);

  const getAddress = (coordinates: number[]) => {
    if (lhRef.current !== null) {
      clearTimeout(lhRef.current);
      lhRef.current = null;
    }
    lhRef.current = setTimeout(async () => {
      const location = (await fetchApiV2Legacy(
        `location/identify?east=${coordinates[0]}&north=${coordinates[1]}`,
        "GET",
      )) as LocationLookupResult;
      setAddress(false);
      setCountry(location.country ?? null);
      setCanton(location.canton ?? null);
      setMunicipality(location.municipality ?? null);
    }, 500);
  };

  const drawOrUpdatePoint = (newPoint: number[]) => {
    const existing = centerFeatureRef.current;
    if (existing) {
      (existing.getGeometry() as Point).setCoordinates(newPoint);
    } else {
      const feature = new Feature({
        name: "Center",
        geometry: new Point(newPoint),
      });
      centerFeatureRef.current = feature;
      positionRef.current?.addFeature(feature);
      mapRef.current?.getView().setResolution(1);
      mapRef.current?.getView().setCenter(newPoint);
    }
  };

  const removeMapFeature = () => {
    centerFeatureRef.current = null;
    positionRef.current?.clear();
    setPoint(null);
  };

  const allowDrawing = () => {
    if (!drawRef.current && positionRef.current) {
      drawRef.current = new Draw({
        type: "Point",
        source: positionRef.current,
      });
    }
    if (drawRef.current) mapRef.current?.addInteraction(drawRef.current);
    if (modifyRef.current) mapRef.current?.removeInteraction(modifyRef.current);
  };

  const allowModifying = () => {
    if (!modifyRef.current && positionRef.current) {
      modifyRef.current = new Modify({
        source: positionRef.current,
      });
    }
    modifyRef.current?.on("modifyend", (e: ModifyEvent) => {
      const modified = e.features.getArray()[0] as Feature | undefined;
      if (modified) updatePointAndGetAddress(modified);
    });

    if (modifyRef.current) mapRef.current?.addInteraction(modifyRef.current);
    if (drawRef.current) mapRef.current?.removeInteraction(drawRef.current);
  };

  const manageMapInteractions = () => {
    const currentPoint = x && y ? [x, y] : null;
    if (isEditable) {
      if (currentPoint) {
        drawOrUpdatePoint(currentPoint);
        allowModifying();
      } else {
        allowDrawing();
      }
    } else {
      if (currentPoint) {
        drawOrUpdatePoint(currentPoint);
      } else {
        removeMapFeature();
      }
      if (drawRef.current) mapRef.current?.removeInteraction(drawRef.current);
      if (modifyRef.current) mapRef.current?.removeInteraction(modifyRef.current);
    }
  };

  // Updates the point state and queries the address of the given point location.
  // This method gets called everytime a feature is added or edited.
  const updatePointAndGetAddress = (feature: Feature) => {
    const coordinates = (feature.getGeometry() as Point).getCoordinates();

    // remove last feature if necessary, so that
    // only one point at the same time is visible.
    const features = positionRef.current?.getFeatures() ?? [];
    const currentFeatureIndex = features.indexOf(feature);
    const lastFeature = features[currentFeatureIndex - 1];
    if (lastFeature) {
      positionRef.current?.removeFeature(lastFeature);
    }

    if (centerFeatureRef.current === null) {
      centerFeatureRef.current = feature;
    }

    setPoint(coordinates);
    setHeight(null);
    setCanton(null);
    setMunicipality(null);
    setAddress(true);

    // Callback after state is updated
    changefeatureRef.current?.(coordinates);
    getAddress(coordinates);
  };

  // Build the OpenLayers map once on mount.
  useEffect(() => {
    const center = [
      (swissExtent[2] - swissExtent[0]) / 2 + swissExtent[0],
      (swissExtent[3] - swissExtent[1]) / 2 + swissExtent[1],
    ];
    const projection = getProjection(SRS);
    projection?.setExtent(swissExtent);

    displayedBaseMapRef.current = currentBasemapName;
    const mapLayers =
      currentBasemapName === "nomap"
        ? []
        : [
            new TileLayer({
              properties: { name: currentBasemapName },
              source: new XYZ({
                url: `https://wmts100.geo.admin.ch/1.0.0/${currentBasemapName}/default/current/3857/{z}/{x}/{y}.jpeg`,
                crossOrigin: crossOrigin,
                attributions: attributions,
              }),
            }),
          ];

    const map = new Map({
      controls: defaultControls({
        attribution: true,
        zoom: false,
        attributionOptions: {
          collapsed: false,
          collapsible: false,
        },
      }),
      layers: mapLayers,
      target: "point",
      view: new View({
        resolution: pointRef.current !== null ? 1 : 500,
        minResolution: 0.1,
        center: pointRef.current !== null ? pointRef.current : center,
        projection: projection ?? undefined,
        extent: swissExtent,
        showFullExtent: true,
      }),
    });
    mapRef.current = map;

    const position = new VectorSource();
    positionRef.current = position;
    map.addLayer(
      new VectorLayer({
        source: position,
        style: (feature: FeatureLike) => detailMapStyleFunction(feature as Feature, highlightedRef.current ?? []),
        zIndex: 100,
      }),
    );

    position.on("addfeature", (e: VectorSourceEvent<Feature>) => {
      if (e.feature) updatePointAndGetAddress(e.feature);
    });

    // @ts-expect-error expose OL map to tests/console
    window.pointOlMap = map;
    // Build-once: deps intentionally empty so the map isn't rebuilt on every prop change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Swap the basemap layer when the user changes it via BasemapSelector.
  useEffect(() => {
    if (!mapRef.current) return;
    if (currentBasemapName !== displayedBaseMapRef.current) {
      displayedBaseMapRef.current = currentBasemapName;
      updateBasemap(mapRef.current, currentBasemapName);
    }
  }, [currentBasemapName]);

  // update map if props have changed or no feature is present.
  useEffect(() => {
    if (!mapRef.current || !positionRef.current) return;
    if (_.isNumber(x) && _.isNumber(y) && x + y !== 0) {
      const newPoint: number[] = [x, y];
      if (!_.isEqual(newPoint, pointRef.current)) {
        setPoint(newPoint);
        setAddress(true);
        getAddress(newPoint);
        drawOrUpdatePoint(newPoint);
        const view = mapRef.current.getView();
        const geom = centerFeatureRef.current?.getGeometry();
        if (geom) view.fit(geom as Point);
        view.setResolution(1);
      }
    }
  }, [x, y]);

  // React to edit-mode toggles by switching between draw / modify / read-only interactions.
  useEffect(() => {
    if (!mapRef.current) return;
    manageMapInteractions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditable]);

  const onZoomIn = () => {
    const view = mapRef.current?.getView();
    const zoom = view?.getZoom();
    if (view && zoom !== undefined) view.setZoom(zoom + 1);
  };

  const onZoomOut = () => {
    const view = mapRef.current?.getView();
    const zoom = view?.getZoom();
    if (view && zoom !== undefined) view.setZoom(zoom - 1);
  };

  const onFitToExtent = () => {
    const view = mapRef.current?.getView();
    const geom = centerFeatureRef.current?.getGeometry();
    if (!view || !geom) return;
    view.fit(geom as Point);
    view.setResolution(1);
  };

  return (
    <Card style={{ position: "relative", padding: 0 }}>
      <div
        className="stbg"
        id="point"
        style={{
          padding: "0px",
          flex: "1 1 100%",
          height: 380,
        }}
      />
      <MapControls onZoomIn={onZoomIn} onZoomOut={onZoomOut} onFitToExtent={onFitToExtent} onRotate={undefined} />
      <Box sx={{ position: "absolute", right: 0, top: 355 }}>
        <BasemapSelector marginBottom="0px" />
      </Box>
      <Box
        style={{
          bottom: "0px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          padding: "0.5em",
          color: "white",
          backgroundColor: "#3e3e3e",
        }}>
        <Box sx={{ flex: "1 1 100%", width: "300px" }}>
          <Stack direction={"row"}>
            <MapPin />
            {_.isArray(point)
              ? "E" + _.round(point[0], 2).toLocaleString() + " N" + _.round(point[1], 2).toLocaleString()
              : "n/p"}
            <Typography>{SRS}</Typography>
          </Stack>
          {_.compact([municipality, canton]).length > 0 ? (
            <Box>{_.compact([municipality, canton]).join(", ")}</Box>
          ) : null}
          {height !== null ? (
            <Stack direction={"row"}>
              <MoveVertical />
              {height} m
            </Stack>
          ) : null}
        </Box>
        <DataCardButtonContainer>
          <Button
            data-cy="apply-button"
            disabled={!_.isArray(point) || address || !isEditable}
            loading={address}
            onClick={() => {
              if (point && applyChange) {
                applyChange(
                  point[0].toFixed(2),
                  point[1].toFixed(2),
                  height !== null ? parseFloat(height) : null,
                  country,
                  canton,
                  municipality,
                );
              }
            }}>
            Apply
          </Button>
          <Button
            disabled={!_.isArray(point)}
            data-cy="height-button"
            onClick={() => {
              if (point && applyChange) {
                getHeight(point[0], point[1]).then(newHeight => {
                  setHeight(newHeight);
                });
              }
            }}>
            <MoveVertical />
          </Button>
        </DataCardButtonContainer>
      </Box>
    </Card>
  );
};

export default PointComponent;
