import { FC, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { MapBrowserEvent, View } from "ol";
import { defaults as defaultControls } from "ol/control/defaults";
import { containsCoordinate, Extent, getCenter } from "ol/extent";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";
import { DragBox, DragRotate, PinchRotate } from "ol/interaction";
import ImageLayer from "ol/layer/Image";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import { loadImage } from "../../../api/file/file.ts";
import { DataExtractionResponse } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import MapControls from "../../../components/buttons/mapControls";
import { ExtractionBoundingBox } from "./labelingInterfaces.tsx";

const drawingStyle = () =>
  new Style({
    stroke: new Stroke({
      color: theme.palette.ai.main,
      width: 2,
    }),
    fill: new Fill({
      color: theme.palette.ai.mainTransparent,
    }),
  });

const transparentBoundingBoxStyle = () =>
  new Style({
    stroke: new Stroke({
      color: "transparent",
    }),
    fill: new Fill({
      color: "transparent",
    }),
  });

interface LabelingDrawContainerProps {
  fileInfo?: DataExtractionResponse;
  onDrawEnd: (extent: number[]) => void;
  boundingBoxes: ExtractionBoundingBox[];
  drawTooltipLabel?: string;
}

export const LabelingDrawContainer: FC<LabelingDrawContainerProps> = ({
  fileInfo,
  onDrawEnd,
  boundingBoxes,
  drawTooltipLabel,
}) => {
  const { t } = useTranslation();
  const [map, setMap] = useState<Map>();
  const [extent, setExtent] = useState<Extent>();
  const tooltipRef = useRef<HTMLDivElement>();
  const zoomIn = () => {
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom) {
        view.setZoom(zoom + 1);
      }
    }
  };

  const zoomOut = () => {
    if (map) {
      const view = map.getView();
      const zoom = view.getZoom();
      if (zoom) {
        view.setZoom(zoom - 1);
      }
    }
  };

  const fitToExtent = () => {
    if (map && extent) {
      const view = map.getView();
      view.fit(extent, { size: map.getSize() });
    }
  };

  const rotateImage = () => {
    if (map) {
      const view = map.getView();
      const rotation = view.getRotation();
      view.setRotation(rotation + Math.PI / 2);
    }
  };

  const updateTooltipPosition = (event: MapBrowserEvent<PointerEvent>) => {
    if (tooltipRef?.current) {
      const [x, y] = event.pixel;
      tooltipRef.current.style.left = x + "px";
      tooltipRef.current.style.top = y + "px";
    }
  };

  const handleMouseLeave = () => {
    if (tooltipRef?.current) {
      tooltipRef.current.style.visibility = "hidden";
    }
  };
  const handleMouseEnter = () => {
    if (tooltipRef?.current) {
      tooltipRef.current.style.visibility = "visible";
    }
  };

  const highlightIntersectingFeatures = (boundingBoxSource: VectorSource, targetFeature: Feature) => {
    const targetExtent = targetFeature.getGeometry()?.getExtent();
    if (!targetExtent) return;

    boundingBoxSource.getFeatures().forEach(feature => {
      const centroid = getCenter(feature.getGeometry()?.getExtent() ?? []);
      const isIntersecting = centroid && containsCoordinate(targetExtent, centroid);

      feature.setStyle(
        new Style({
          fill: new Fill({
            color: isIntersecting ? theme.palette.ai.mainTransparent : "transparent",
          }),
        }),
      );
    });
  };

  useEffect(() => {
    // @ts-expect-error - Attach map object to window to make it accessible for E2E testing
    window.labelingImage = map;
  }, [map]);

  useEffect(() => {
    if (map && drawTooltipLabel) {
      const layers = map.getLayers().getArray();

      const drawingLayer = layers.find(
        layer => layer instanceof VectorLayer && layer.get("name") === "drawingLayer",
      ) as VectorLayer<Feature<Geometry>>;
      const drawingSource = drawingLayer?.getSource() as VectorSource | undefined;

      const boundingBoxLayer = layers.find(
        layer => layer instanceof VectorLayer && layer.get("name") === "boundingBoxLayer",
      ) as VectorLayer<Feature<Geometry>>;
      const boundingBoxSource = boundingBoxLayer?.getSource() as VectorSource | undefined;

      if (drawingSource && boundingBoxSource) {
        drawingSource.clear();
        boundingBoxSource?.clear();
        const dragBox = new DragBox();
        dragBox.on("boxstart", () => {
          // Add all transparent bounding boxes to map once the selection starts
          boundingBoxes.forEach(box => {
            const bboxExtent = [box.x0, -box.y1, box.x1, -box.y0];
            boundingBoxSource.addFeature(
              new Feature({
                geometry: fromExtent(bboxExtent),
              }),
            );
          });
        });

        dragBox.on("boxdrag", () => {
          // Update style of intersecting bounding boxes when draging the selectionbox
          const boxFeature = new Feature({
            geometry: fromExtent(dragBox.getGeometry().getExtent()),
          });
          highlightIntersectingFeatures(boundingBoxSource, boxFeature);
        });

        dragBox.on("boxend", () => {
          const boxFeature = new Feature({
            geometry: fromExtent(dragBox.getGeometry().getExtent()),
          });
          drawingSource.addFeature(boxFeature);
          const tmpMap = map;
          if (tmpMap) {
            tmpMap.removeInteraction(dragBox);
            tmpMap
              .getInteractions()
              .getArray()
              .forEach(interaction => {
                if (interaction instanceof DragBox) {
                  tmpMap.removeInteraction(interaction);
                }
              });
            tmpMap.getTargetElement().style.cursor = "";

            if (tooltipRef?.current) {
              tooltipRef.current.style.visibility = "hidden";
              tmpMap.un("pointermove", updateTooltipPosition);
              tmpMap.getTargetElement().removeEventListener("mouseleave", handleMouseLeave);
              tmpMap.getTargetElement().removeEventListener("mouseenter", handleMouseEnter);
            }
            setMap(tmpMap);
          }
        });

        const tmpMap = map;
        tmpMap.addInteraction(dragBox);
        tmpMap.getTargetElement().style.cursor = "crosshair";

        if (tooltipRef?.current) {
          tooltipRef.current.innerHTML = t(drawTooltipLabel);
          tooltipRef.current.style.visibility = "visible";
          tmpMap.getTargetElement().addEventListener("mouseleave", handleMouseLeave);
          tmpMap.getTargetElement().addEventListener("mouseenter", handleMouseEnter);
          tmpMap.on("pointermove", updateTooltipPosition);
        }
        setMap(tmpMap);
      }
    }
  }, [drawTooltipLabel, map, t]);

  useEffect(() => {
    if (fileInfo) {
      if (map) {
        let currentFileName = "";
        map
          .getLayers()
          .getArray()
          .forEach(layer => {
            if (layer instanceof ImageLayer) {
              currentFileName = layer.getSource().getUrl();
            }
          });
        if (currentFileName === fileInfo.fileName) {
          return;
        }
      }

      if (map) {
        map.dispose();
        setMap(undefined);
      }

      const extent = [0, -fileInfo.height, fileInfo.width, 0];
      setExtent(extent);
      const projection = new Projection({
        code: "image",
        units: "pixels",
        extent: extent,
      });

      const imageLayer = new ImageLayer({
        source: new Static({
          url: fileInfo.fileName,
          projection: projection,
          imageExtent: extent,
          imageLoadFunction: (image, src) => {
            loadImage(src).then(blob => {
              (image.getImage() as HTMLImageElement).src = URL.createObjectURL(blob);
            });
          },
        }),
      });

      const drawingSource = new VectorSource();
      drawingSource.on("addfeature", e => {
        const extent = e.feature?.getGeometry()?.getExtent();
        if (extent) {
          onDrawEnd(extent.map(coord => Math.abs(coord)));
        }
      });
      const drawingLayer = new VectorLayer({
        source: drawingSource,
        style: drawingStyle,
      });
      drawingLayer.set("name", "drawingLayer");

      const boundingBoxSource = new VectorSource();
      const boundingBoxLayer = new VectorLayer({
        source: boundingBoxSource,
        style: transparentBoundingBoxStyle,
      });
      boundingBoxLayer.set("name", "boundingBoxLayer");

      const initMap = new Map({
        layers: [imageLayer, drawingLayer, boundingBoxLayer],
        target: "map",
        controls: defaultControls({
          attribution: false,
          zoom: false,
          rotate: false,
        }),
        view: new View({
          minResolution: 0.1,
          zoom: 0,
          projection: projection,
          center: getCenter(extent),
          extent: extent,
          showFullExtent: true,
        }),
      });
      initMap
        .getInteractions()
        .getArray()
        .forEach(interaction => {
          if (interaction instanceof DragRotate || interaction instanceof PinchRotate) {
            initMap.removeInteraction(interaction);
          }
        });
      setMap(initMap);
    }
  }, [fileInfo, onDrawEnd, map]);

  return (
    <>
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFitToExtent={fitToExtent} onRotate={rotateImage} />
      <Box id="map" sx={{ height: "100%", width: "100%", position: "absolute" }} />
      <Box
        data-cy="labeling-draw-tooltip"
        ref={tooltipRef}
        sx={{
          position: "absolute",
          borderRadius: "4px",
          backgroundColor: "#1C2834",
          color: "white",
          padding: "4px 8px",
          margin: "14px 2px",
          visibility: "hidden",
        }}
      />
    </>
  );
};
