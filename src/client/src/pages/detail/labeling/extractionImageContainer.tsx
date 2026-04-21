import { FC, useCallback, useEffect, useRef, useState } from "react";
import Feature from "ol/Feature";
import { Geometry } from "ol/geom";
import { fromExtent } from "ol/geom/Polygon";
import BaseLayer from "ol/layer/Base";
import VectorLayer from "ol/layer/Vector";
import Map from "ol/Map";
import VectorSource from "ol/source/Vector";
import { Fill, Stroke, Style } from "ol/style";
import { BoreholeAttachment } from "../../../api/apiInterfaces.ts";
import { useFileInfo, useProfileImage } from "../../../api/file/file.ts";
import { theme } from "../../../AppTheme.ts";
import { ExtractedLithologicalDescription } from "../form/stratigraphy/lithologicalDescription.ts";
import { ExtractionBoundingBox } from "./labelingInterfaces.tsx";
import { LabelingView } from "./labelingView.tsx";

interface ExtractionImageContainerProps {
  extractedDescriptions?: ExtractedLithologicalDescription[];
  currentPageNumber: number;
  selectedFile: BoreholeAttachment | undefined;
  activePage: number;
  setActivePage: (page: number) => void;
  pageCount?: number;
  setPageCount: (count: number) => void;
}

export const ExtractionImageContainer: FC<ExtractionImageContainerProps> = ({
  extractedDescriptions,
  currentPageNumber,
  selectedFile,
  activePage,
  setActivePage,
  pageCount,
  setPageCount,
}) => {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const mapRef = useRef<Map>(null);
  const { data: fileInfo } = useFileInfo(selectedFile?.id, activePage);
  const { data: image, isLoading } = useProfileImage(fileInfo?.fileName);

  // Keep page count in sync with file info
  useEffect(() => {
    if (!fileInfo) return;
    setPageCount(fileInfo.count);

    // Reset to page 1 if count changes
    if (pageCount !== fileInfo.count) {
      setActivePage(1);
    }
  }, [fileInfo, pageCount, setActivePage, setPageCount]);

  const getSourceFromLayerName = useCallback((layers: BaseLayer[], layerName: string) => {
    const layer = layers.find(l => l instanceof VectorLayer && l.get("name") === layerName) as
      | VectorLayer<VectorSource<Feature<Geometry>>>
      | undefined;
    return layer?.getSource() as VectorSource | undefined;
  }, []);

  const addBoundingBoxesToSource = (boxes: ExtractionBoundingBox[], source: VectorSource, page: number) => {
    for (const box of boxes.filter(box => box.page_number === page)) {
      const bboxExtent = [box.x0, -box.y1, box.x1, -box.y0];
      source.addFeature(new Feature({ geometry: fromExtent(bboxExtent) }));
    }
  };

  useEffect(() => {
    const hasImageLoaded = image !== null && !isLoading;
    if (!mapInstance || !extractedDescriptions || extractedDescriptions.length === 0 || !hasImageLoaded) return;

    const layers = mapInstance.getLayers().getArray();
    const highlightDescriptionsSource = getSourceFromLayerName(layers, "highlightDescriptionsLayer");
    const highlightDepthSource = getSourceFromLayerName(layers, "highlightDepthLayer");

    if (!highlightDescriptionsSource || !highlightDepthSource) return;
    highlightDescriptionsSource.clear();
    highlightDepthSource.clear();

    setTimeout(() => {
      for (const description of extractedDescriptions) {
        addBoundingBoxesToSource(description.descriptionBoundingBoxes, highlightDescriptionsSource, currentPageNumber);
        addBoundingBoxesToSource(description.startDepthBoundingBoxes, highlightDepthSource, currentPageNumber);
        addBoundingBoxesToSource(description.endDepthBoundingBoxes, highlightDepthSource, currentPageNumber);
      }
    }, 1000); // Add small timeout to ensure the image is fully rendered before adding bounding boxes
  }, [currentPageNumber, extractedDescriptions, mapInstance, getSourceFromLayerName, image, isLoading]);

  const onMapInitialized = useCallback((map: Map) => {
    mapRef.current = map;
    setMapInstance(map);
    const highlightDescriptionsLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({ color: theme.palette.ai.textHighlights }),
        stroke: new Stroke({ color: theme.palette.ai.main, width: 1 }),
      }),
    });

    const highlightDepthLayer = new VectorLayer({
      source: new VectorSource(),
      style: new Style({
        fill: new Fill({ color: theme.palette.ai.secondaryTextHighlights }),
        stroke: new Stroke({ color: theme.palette.ai.secondary, width: 1 }),
      }),
    });
    highlightDepthLayer.set("name", "highlightDepthLayer");
    highlightDescriptionsLayer.set("name", "highlightDescriptionsLayer");
    map.addLayer(highlightDepthLayer);
    map.addLayer(highlightDescriptionsLayer);
  }, []);

  if (!image) return null;

  return (
    <LabelingView
      mapDomId={"extraction-map"}
      fileName={fileInfo?.fileName}
      imageSize={fileInfo ?? undefined}
      image={image}
      onMapInitialized={onMapInitialized}
    />
  );
};
