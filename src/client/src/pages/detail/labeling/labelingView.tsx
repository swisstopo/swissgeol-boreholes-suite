import { FC, useEffect, useState } from "react";
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
import MapControls from "../../../components/buttons/mapControls.jsx";

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
  mapDomId: string;
  image: HTMLImageElement | null;
  fileName?: string;
  imageSize?: { width: number; height: number } | null;
  onMapInitialized?: (map: Map) => void;
}

export const LabelingView: FC<LabelingViewProps> = ({ mapDomId, image, fileName, imageSize, onMapInitialized }) => {
  const [map, setMap] = useState<Map>();

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
    if (!image || !fileName) return;

    if (map) {
      const imageLayer = map
        .getLayers()
        .getArray()
        .find(layer => layer instanceof ImageLayer);
      const currentFileName = imageLayer?.get("name");
      if (currentFileName === fileName) {
        return;
      }
      map.dispose();
      // @ts-expect-error - Clear window reference when disposing
      window[mapDomId] = undefined;
      setMap(undefined);
    }

    const extent = imageSize ? [0, -imageSize.height, imageSize.width, 0] : undefined;

    const imageLayer = new ImageLayer();
    imageLayer.set("name", fileName);

    const initMap = new Map({
      layers: [imageLayer],
      target: mapDomId,
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

    const imageExtent = extent ?? [0, -image.naturalHeight, image.naturalWidth, 0];
    initMap.setView(createView(imageExtent, initMap.getView()));

    const source = new Static({
      url: image.src,
      imageExtent,
    });
    imageLayer.setSource(source);

    // Set window reference only after everything is initialized
    // @ts-expect-error - Attach map to window after complete initialization
    window["labeling-map"] = initMap;
  }, [fileName, image, imageSize, map, mapDomId, t]);

  useEffect(() => {
    if (map) {
      onMapInitialized?.(map);
    }
  }, [map, onMapInitialized]);

  return (
    <>
      <MapControls onZoomIn={zoomIn} onZoomOut={zoomOut} onFitToExtent={fitToExtent} onRotate={rotateImage} />
      <Box id={mapDomId} sx={{ height: "100%", width: "100%", position: "absolute" }} />
    </>
  );
};
