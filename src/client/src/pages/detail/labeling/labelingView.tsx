import { FC, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box } from "@mui/material";
import { View } from "ol";
import { defaults as defaultControls } from "ol/control/defaults";
import { Extent, getCenter } from "ol/extent";
import { DragRotate, PinchRotate } from "ol/interaction";
import ImageLayer from "ol/layer/Image";
import Map from "ol/Map";
import Projection from "ol/proj/Projection";
import Static from "ol/source/ImageStatic";
import { ApiError } from "../../../api/apiInterfaces.js";
import { AlertContext } from "../../../components/alert/alertContext.js";
import MapControls from "../../../components/buttons/mapControls.jsx";

const blobToImage = (blob: Blob): Promise<HTMLImageElement> => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(blob);
  });
};

const createView = (extent?: Extent, currentView?: View): View => {
  const projection = new Projection({
    code: "image",
    units: "pixels",
    extent: extent,
  });

  return new View({
    minResolution: 0.1,
    zoom: 0,
    rotation: currentView?.getRotation() ?? 0,
    projection: projection,
    center: currentView?.getCenter() ?? (extent ? getCenter(extent) : undefined),
    extent: extent,
    showFullExtent: true,
  });
};

interface LabelingViewProps {
  fileName?: string;
  imageSize?: { width: number; height: number };
  loadImage: () => Promise<Blob | null>;
  onMapInitialized?: (map: Map) => void;
}

export const LabelingView: FC<LabelingViewProps> = ({ fileName, imageSize, loadImage, onMapInitialized }) => {
  const [map, setMap] = useState<Map>();
  const { showAlert } = useContext(AlertContext);
  const { t } = useTranslation();

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
    if (map) {
      const view = map.getView();
      const extent = view.getProjection().getExtent();
      if (extent) {
        view.fit(extent, { size: map.getSize() });
      }
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
    if (fileName) {
      if (map) {
        const imageLayer = map
          .getLayers()
          .getArray()
          .find(layer => layer instanceof ImageLayer);
        const currentFileName = imageLayer?.get("name");
        if (currentFileName === fileName) {
          return;
        }
      }

      if (map) {
        map.dispose();
        setMap(undefined);
      }

      const extent = imageSize ? [0, -imageSize.height, imageSize.width, 0] : undefined;

      const imageLayer = new ImageLayer();
      imageLayer.set("name", fileName);

      const initMap = new Map({
        layers: [imageLayer],
        target: "map",
        controls: defaultControls({
          attribution: false,
          zoom: false,
          rotate: false,
        }),
        view: createView(extent),
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

      const loadImageSource = async () => {
        const blob = await loadImage();
        if (!blob) return;

        const image = await blobToImage(blob);

        const imageExtent = extent ?? [0, -image.naturalHeight, image.naturalWidth, 0];
        initMap.setView(createView(imageExtent, initMap.getView()));

        const source = new Static({
          url: image.src,
          imageExtent,
        });
        imageLayer.setSource(source);
      };

      loadImageSource().catch(error => {
        const message = error instanceof ApiError ? error.message : "errorLoadingImage";
        showAlert(t(message), "error");
      });
    }
  }, [fileName, imageSize, loadImage, map, showAlert, t]);

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
