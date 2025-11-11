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
import { getDataExtractionFileInfo, loadImage } from "../../../api/file/file.ts";
import { theme } from "../../../AppTheme.ts";
import { ExtractedLithologicalDescription } from "../form/stratigraphy/lithologicalDescription.ts";
import { useLabelingContext } from "./labelingContext.tsx";
import { ExtractionBoundingBox } from "./labelingInterfaces.tsx";
import { LabelingView } from "./labelingView.tsx";

interface ExtractionImageContainerProps {
  extractedDescriptions?: ExtractedLithologicalDescription[];
  currentPageNumber: number;
  selectedFile: BoreholeAttachment | undefined;
  activePage: number;
  setActivePage: (page: number) => void;
  setPageCount?: (count: number) => void;
}

export const ExtractionImageContainer: FC<ExtractionImageContainerProps> = ({
  extractedDescriptions,
  currentPageNumber,
  selectedFile,
  activePage,
  setActivePage,
  setPageCount,
}) => {
  const [mapInstance, setMapInstance] = useState<Map | null>(null);
  const [hasImageLoaded, setHasImageLoaded] = useState(false);
  const { fileInfo, setFileInfo } = useLabelingContext();
  const mapRef = useRef<Map>(null);

  useEffect(() => {
    if (!selectedFile) return;
    const fetchExtractionData = async () => {
      const fileInfoResponse = await getDataExtractionFileInfo(selectedFile.id, activePage);
      const { fileName, count } = fileInfoResponse;
      let newActivePage = activePage;
      if (setPageCount !== undefined) setPageCount(count);
      if (fileInfo?.count !== count) {
        newActivePage = 1;
        setActivePage(newActivePage);
      }
      if (fileInfo?.fileName !== fileName) {
        setFileInfo(fileInfoResponse);
      }
    };

    void fetchExtractionData();
  }, [activePage, selectedFile, fileInfo?.count, fileInfo?.fileName, setActivePage, setFileInfo, setPageCount]);

  const loadImageFromApi = useCallback(async () => {
    if (!fileInfo) return null;
    const imageLoaded = await loadImage(fileInfo.fileName);
    setHasImageLoaded(true);
    return imageLoaded;
  }, [fileInfo]);

  const getSourceFromLayerName = useCallback((layers: BaseLayer[], layerName: string) => {
    const layer = layers.find(l => l instanceof VectorLayer && l.get("name") === layerName) as VectorLayer<
      Feature<Geometry>
    >;
    return layer?.getSource();
  }, []);

  const addBoundingBoxesToSource = (boxes: ExtractionBoundingBox[], source: VectorSource, page: number) => {
    for (const box of boxes.filter(box => box.page_number === page)) {
      const bboxExtent = [box.x0, -box.y1, box.x1, -box.y0];
      source.addFeature(new Feature({ geometry: fromExtent(bboxExtent) }));
    }
  };

  useEffect(() => {
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

    setHasImageLoaded(false);
  }, [currentPageNumber, extractedDescriptions, mapInstance, hasImageLoaded, getSourceFromLayerName]);

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

  return (
    <LabelingView
      fileName={fileInfo?.fileName}
      imageSize={fileInfo}
      loadImage={loadImageFromApi}
      onMapInitialized={onMapInitialized}
    />
  );
};
