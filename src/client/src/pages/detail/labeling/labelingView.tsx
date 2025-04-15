import { FC, useEffect, useState } from "react";
import { Box } from "@mui/material";
import { View } from "ol";
import { defaults as defaultControls } from "ol/control/defaults";
import { Extent, getCenter } from "ol/extent";
import { DragRotate, PinchRotate } from "ol/interaction";
import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import MapControls from "../../../components/buttons/mapControls.jsx";

interface LabelingViewProps {
  fileInfo?: { fileName: string; width: number; height: number };
  loadImage: () => Promise<Blob | null>;
  onMapInitialized?: (map: Map) => void;
}

export const LabelingView: FC<LabelingViewProps> = ({ fileInfo, loadImage, onMapInitialized }) => {
  const [map, setMap] = useState<Map>();
  const [extent, setExtent] = useState<Extent>();

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

  useEffect(() => {
    // @ts-expect-error - Attach map object to window to make it accessible for E2E testing
    window.labelingImage = map;
  }, [map]);

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
          imageLoadFunction: async image => {
            const blob = await loadImage();
            if (blob) {
              (image.getImage() as HTMLImageElement).src = URL.createObjectURL(blob);
            }
          },
        }),
      });

      const initMap = new Map({
        layers: [imageLayer],
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
  }, [fileInfo, loadImage, map]);

  useEffect(() => {
    if (map) {
      onMapInitialized?.(map);
    }
  }, [map, onMapInitialized]);

  return (
    <>
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFitToExtent={fitToExtent} onRotate={rotateImage} />
      <Box id="map" sx={{ height: "100%", width: "100%", position: "absolute" }} />
    </>
  );
};
