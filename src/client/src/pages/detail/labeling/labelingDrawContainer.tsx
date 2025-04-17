import { FC, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { MapBrowserEvent } from "ol";
import { containsCoordinate, getCenter } from "ol/extent";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import Polygon, { fromExtent } from "ol/geom/Polygon";
import { DragBox } from "ol/interaction";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import { loadImage } from "../../../api/file/file.ts";
import { DataExtractionResponse } from "../../../api/file/fileInterfaces.ts";
import { theme } from "../../../AppTheme.ts";
import { ExtractionBoundingBox, ExtractionType } from "./labelingInterfaces.tsx";
import { LabelingView } from "./labelingView.tsx";

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
  extractionType?: ExtractionType;
}

export const LabelingDrawContainer: FC<LabelingDrawContainerProps> = ({
  fileInfo,
  onDrawEnd,
  boundingBoxes,
  drawTooltipLabel,
  extractionType,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef<Map>();
  const tooltipRef = useRef<HTMLDivElement>();

  const loadImageFromApi = useCallback(async () => {
    return fileInfo ? await loadImage(fileInfo.fileName) : null;
  }, [fileInfo]);

  const updateTooltipPosition = useCallback((x: number, y: number) => {
    if (tooltipRef?.current) {
      tooltipRef.current.style.left = x + "px";
      tooltipRef.current.style.top = y + "px";
    }
  }, []);

  const onPointerMove = useCallback(
    (event: MapBrowserEvent<PointerEvent>) => {
      const [x, y] = event.pixel;
      updateTooltipPosition(x, y);
    },
    [updateTooltipPosition],
  );

  const handleMouseLeave = () => {
    if (tooltipRef?.current) {
      tooltipRef.current.style.visibility = "hidden";
    }
  };
  const handleMouseEnter = () => {
    if (tooltipRef?.current && tooltipRef.current.innerHTML !== "") {
      tooltipRef.current.style.visibility = "visible";
    }
  };

  const highlightIntersectingFeatures = (
    boundingBoxSource: VectorSource,
    highlightsLayerSource: VectorSource,
    targetFeature: Feature,
  ) => {
    const targetExtent = targetFeature.getGeometry()?.getExtent();
    if (!targetExtent) return;

    const intersectingFeatures: Feature[] = [];

    boundingBoxSource.getFeatures().forEach(feature => {
      const centroid = getCenter(feature.getGeometry()?.getExtent() ?? []);
      const isIntersecting = centroid && containsCoordinate(targetExtent, centroid);
      if (isIntersecting) {
        intersectingFeatures.push(feature);
      }
    });

    if (intersectingFeatures.length === 0) return;
    const mergedCoordinates = intersectingFeatures.flatMap(feature => {
      const geometry = feature.getGeometry() as Polygon;
      return geometry.getCoordinates(); // Extract outer rings
    });

    // Create a new merged Polygon to avoid darkening fill for intersecting bounding boxes
    const mergedFeature = new Feature(new Polygon(mergedCoordinates));
    mergedFeature.setStyle(
      new Style({
        fill: new Fill({ color: theme.palette.ai.textHighlights }),
      }),
    );
    highlightsLayerSource.clear();
    highlightsLayerSource.addFeature(mergedFeature);
  };

  const getSourceFromLayerName = (layers: BaseLayer[], layerName: string): VectorSource | undefined => {
    const drawingLayer = layers.find(
      layer => layer instanceof VectorLayer && layer.get("name") === layerName,
    ) as VectorLayer<Feature<Geometry>>;
    return drawingLayer?.getSource() as VectorSource | undefined;
  };

  // Initially move tooltip out of view, to prevent wrong positioning when clicking and before pointermove event
  useEffect(() => {
    updateTooltipPosition(0, -10000);
  }, [drawTooltipLabel, updateTooltipPosition]);

  useEffect(() => {
    const map = mapRef.current;
    if (map && drawTooltipLabel) {
      const layers = map.getLayers().getArray();

      const drawingSource = getSourceFromLayerName(layers, "drawingLayer");
      const boundingBoxSource = getSourceFromLayerName(layers, "boundingBoxLayer");
      const highlightsSource = getSourceFromLayerName(layers, "highlightsLayer");

      if (drawingSource && boundingBoxSource && highlightsSource) {
        drawingSource.clear();
        boundingBoxSource.clear();
        highlightsSource.clear();
        map
          .getInteractions()
          .getArray()
          .forEach(interaction => {
            if (interaction instanceof DragBox) {
              map.removeInteraction(interaction);
            }
          }); // Fix bug where sometimes two interactions where added on initial render

        const dragBox = new DragBox();
        dragBox.on("boxstart", () => {
          if (tooltipRef?.current) {
            map.un("pointermove", onPointerMove);
            tooltipRef.current.style.visibility = "hidden";
            tooltipRef.current.innerHTML = "";
            map.getTargetElement().removeEventListener("mouseleave", handleMouseLeave);
            map.getTargetElement().removeEventListener("mouseenter", handleMouseEnter);
          }
          if (extractionType === "text") {
            // Add all transparent bounding boxes to map once the selection starts
            boundingBoxes.forEach(box => {
              const bboxExtent = [box.x0, -box.y1, box.x1, -box.y0];
              boundingBoxSource.addFeature(
                new Feature({
                  geometry: fromExtent(bboxExtent),
                }),
              );
            });
          }
        });

        dragBox.on("boxdrag", () => {
          // Update style of intersecting bounding boxes when draging the selectionbox
          const boxFeature = new Feature({
            geometry: fromExtent(dragBox.getGeometry().getExtent()),
          });
          highlightIntersectingFeatures(boundingBoxSource, highlightsSource, boxFeature);
        });

        dragBox.on("boxend", () => {
          const boxFeature = new Feature({
            geometry: fromExtent(dragBox.getGeometry().getExtent()),
          });
          drawingSource.addFeature(boxFeature);
          if (map) {
            map
              .getInteractions()
              .getArray()
              .forEach(interaction => {
                if (interaction instanceof DragBox) {
                  map.removeInteraction(interaction);
                }
              });
            const targetElement = map.getTargetElement();
            if (targetElement) {
              targetElement.style.cursor = "";
            }
          }
        });

        map.addInteraction(dragBox);
        map.getTargetElement().style.cursor = "crosshair";

        if (tooltipRef?.current) {
          tooltipRef.current.innerHTML = t(drawTooltipLabel);
          tooltipRef.current.style.visibility = "visible";
          map.getTargetElement().addEventListener("mouseleave", handleMouseLeave);
          map.getTargetElement().addEventListener("mouseenter", handleMouseEnter);
          map.on("pointermove", onPointerMove);
        }
      }
    }
  }, [boundingBoxes, drawTooltipLabel, extractionType, onPointerMove, t]);

  const onMapInitialized = useCallback(
    (map: Map) => {
      mapRef.current = map;

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

      const highlightSource = new VectorSource();
      const highlightsLayer = new VectorLayer({
        source: highlightSource,
        style: new Style({
          fill: new Fill({
            color: theme.palette.ai.mainTransparent,
          }),
        }),
      });
      highlightsLayer.set("name", "highlightsLayer");
      map.addLayer(drawingLayer);
      map.addLayer(boundingBoxLayer);
      map.addLayer(highlightsLayer);
    },
    [onDrawEnd],
  );

  return (
    <>
      <LabelingView
        fileName={fileInfo?.fileName}
        imageSize={fileInfo}
        loadImage={loadImageFromApi}
        onMapInitialized={onMapInitialized}
      />
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
