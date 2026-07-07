import Feature from "ol/Feature";
import { Circle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";
import { theme } from "../../AppTheme.ts";

const boreholeStyleCache: Record<number, Circle> = {};
const virtualBoreholeStyleCache: Record<number, RegularShape> = {};
const trialpitStyleCache: Record<number, RegularShape> = {};
const probingStyleCache: Record<number, RegularShape> = {};
const deepBoreholeStyleCache: Record<number, RegularShape> = {};
const otherStyleCache: Record<number, RegularShape> = {};
const clusterStyleCache: Record<number, Style> = {};

const blackStroke = new Stroke({ color: "black", width: 1 });
const greenFill = new Fill({ color: theme.palette.map.restrictionOpen });
const redFill = new Fill({ color: theme.palette.map.restrictionClosed });
const blackFill = new Fill({ color: theme.palette.map.restrictionUnknown });

const innerSelectedStyle = new Style({
  image: new Circle({
    radius: 10,
    fill: new Fill({ color: theme.palette.map.selectedFill }),
    stroke: new Stroke({
      color: theme.palette.map.selectedStroke,
      width: 1,
    }),
  }),
});

const outerSelectedStyle = new Style({
  image: new Circle({
    radius: 11,
    stroke: new Stroke({
      color: theme.palette.map.selectedOuterStroke,
      width: 1,
    }),
  }),
});

export const drawStyle = new Style({
  fill: new Fill({
    color: theme.palette.map.drawFill,
  }),
  stroke: new Stroke({
    color: theme.palette.map.drawStroke,
    width: 3,
  }),
});

export function styleFunction(feature: Feature, highlighted: number[]): Style[] {
  const selected = highlighted?.length > 0 && highlighted.includes(feature.get("id"));
  const res = feature.get("restriction") as number;
  let fill: Fill;
  if (res === 20111001) {
    fill = greenFill;
  } else if ([20111003, 20111002].includes(res)) {
    fill = redFill;
  } else {
    fill = blackFill;
  }

  let conf: { image: Circle | RegularShape };
  const type = feature.get("type") as number;
  if (type === 20101001) {
    // boreholes
    let image = boreholeStyleCache[res];
    if (!image) {
      image = new Circle({
        radius: 6,
        stroke: blackStroke,
        fill: fill,
      });
      boreholeStyleCache[res] = image;
    }
    conf = { image };
  } else if (type === 30000307) {
    // virtual borehole
    let image = virtualBoreholeStyleCache[res];
    if (!image) {
      image = new RegularShape({
        fill: fill,
        stroke: blackStroke,
        points: 5,
        radius: 8,
        radius2: 4,
        angle: 0,
      });
      virtualBoreholeStyleCache[res] = image;
    }
    conf = { image };
  } else if (type === 20101003) {
    // trial pits
    let image = trialpitStyleCache[res];
    if (!image) {
      image = new RegularShape({
        fill: fill,
        stroke: blackStroke,
        points: 3,
        radius: 8,
        angle: 0,
      });
      trialpitStyleCache[res] = image;
    }
    conf = { image };
  } else if (type === 20101002) {
    // dynamic probing
    let image = probingStyleCache[res];
    if (!image) {
      image = new RegularShape({
        fill: fill,
        stroke: blackStroke,
        points: 3,
        radius: 8,
        rotation: Math.PI,
        angle: 0,
      });
      probingStyleCache[res] = image;
    }
    conf = { image };
  } else if (type === 20101004) {
    // other
    let image = otherStyleCache[res];
    if (!image) {
      image = new RegularShape({
        fill: fill,
        stroke: blackStroke,
        points: 6,
        radius: 7,
        angle: 0,
      });
      otherStyleCache[res] = image;
    }
    conf = { image };
  } else {
    // Not set
    let image = deepBoreholeStyleCache[res];
    if (!image) {
      image = new RegularShape({
        fill: fill,
        stroke: blackStroke,
        points: 4,
        radius: 8,
        rotation: 0.25 * Math.PI,
        angle: 0,
      });
      deepBoreholeStyleCache[res] = image;
    }
    conf = { image };
  }

  if (selected) {
    return [innerSelectedStyle, outerSelectedStyle, new Style(conf)];
  }

  return [new Style(conf)];
}

export function clusterStyleFunction(length: number): Style {
  const circleSize = 8 + length.toString().length * 2.5;
  let clusterStyle = clusterStyleCache[circleSize];
  if (!clusterStyle) {
    clusterStyle = new Style({
      image: new Circle({
        radius: circleSize,
        stroke: new Stroke({
          color: theme.palette.map.clusterStroke,
          width: 8,
        }),
        fill: new Fill({
          color: theme.palette.map.clusterFill,
        }),
      }),
      text: new Text({
        text: length.toString(),
        scale: 1.5,
        fill: new Fill({
          color: theme.palette.map.clusterText,
        }),
      }),
    });
    clusterStyleCache[circleSize] = clusterStyle;
  }

  clusterStyle.getText()!.setText(length.toString());

  return clusterStyle;
}

export function detailMapStyleFunction(feature: Feature, highlighted: number[]): Style[] {
  const selected = highlighted?.includes(feature.get("id") as number);

  const conf = {
    image: new Circle({
      radius: selected ? 10 : 6,
      fill: selected
        ? new Fill({ color: theme.palette.map.detailSelectedFill })
        : new Fill({ color: theme.palette.map.detailUnselectedFill }),
      stroke: new Stroke({ color: "black", width: 1 }),
    }),
  };

  return [new Style(conf)];
}
