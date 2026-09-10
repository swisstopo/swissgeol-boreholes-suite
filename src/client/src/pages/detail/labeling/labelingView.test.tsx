// @vitest-environment jsdom
import { FC, useCallback, useEffect, useRef } from "react";
import { cleanup, render } from "@testing-library/react";
import Map from "ol/Map";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { LabelingView } from "./labelingView.tsx";

vi.mock("../../../components/buttons/mapControls.jsx", () => ({
  default: () => null,
}));

beforeAll(() => {
  // OpenLayers observes its target element, which jsdom does not implement.
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

afterEach(() => {
  cleanup();
});

const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

const createImage = () => {
  const image = new Image();
  image.src = transparentPixel;
  return image;
};

interface MapConsumerProps {
  fileName: string;
  onMapConfigured: (map: Map | null) => void;
}

/**
 * Mirrors LabelingDrawContainer: it keeps the published map in a ref and configures that map from
 * an effect that runs in the same commit as the file name change (parent effects run after the
 * effects of their children).
 */
const MapConsumer: FC<MapConsumerProps> = ({ fileName, onMapConfigured }) => {
  const mapRef = useRef<Map | null>(null);
  const onMapInitialized = useCallback((map: Map) => {
    mapRef.current = map;
  }, []);

  useEffect(() => {
    onMapConfigured(mapRef.current);
  }, [fileName, onMapConfigured]);

  return (
    <LabelingView
      mapDomId="labeling-map"
      fileName={fileName}
      image={createImage()}
      imageSize={{ width: 100, height: 200 }}
      onMapInitialized={onMapInitialized}
    />
  );
};

describe("LabelingView", () => {
  it("publishes the replacement map before consumers configure it", () => {
    const onMapConfigured = vi.fn();
    const { rerender } = render(<MapConsumer fileName="profile-1.png" onMapConfigured={onMapConfigured} />);

    rerender(<MapConsumer fileName="profile-2.png" onMapConfigured={onMapConfigured} />);

    const configuredMap = onMapConfigured.mock.lastCall?.[0] as Map | null;
    expect(configuredMap).not.toBeNull();
    // A disposed map has no target element, so configuring it throws on every target access.
    expect(configuredMap?.getTargetElement()).not.toBeNull();
    expect(configuredMap).toBe(window["labeling-map" as keyof Window]);
  });
});
