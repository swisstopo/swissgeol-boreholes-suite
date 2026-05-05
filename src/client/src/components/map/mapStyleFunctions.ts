import Feature from "ol/Feature";
import { Circle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";

const boreholeStyleCache: Record<number, Circle> = {};
const virtualBoreholeStyleCache: Record<number, RegularShape> = {};
const trialpitStyleCache: Record<number, RegularShape> = {};
const probingStyleCache: Record<number, RegularShape> = {};
const deepBoreholeStyleCache: Record<number, RegularShape> = {};
const otherStyleCache: Record<number, RegularShape> = {};
const clusterStyleCache: Record<number, Style> = {};

const blackStroke = new Stroke({ color: "black", width: 1 });
const greenFill = new Fill({ color: "rgb(33, 186, 69)" });
const redFill = new Fill({ color: "rgb(220, 0, 24)" });
const blackFill = new Fill({ color: "rgb(0, 0, 0)" });

const innerSelectedStyle = new Style({
  image: new Circle({
    radius: 10,
    fill: new Fill({ color: "#ffff00" }),
    stroke: new Stroke({
      color: "rgba(0, 0, 0, 0.75)",
      width: 1,
    }),
  }),
});

const outerSelectedStyle = new Style({
  image: new Circle({
    radius: 11,
    stroke: new Stroke({
      color: "rgba(120, 120, 120, 0.5)",
      width: 1,
    }),
  }),
});

export const drawStyle = new Style({
  fill: new Fill({
    color: "rgba(255, 255, 255, 0.5)",
  }),
  stroke: new Stroke({
    color: "#0099ff",
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
          color: "rgba(43, 132, 204, 0.5)",
          width: 8,
        }),
        fill: new Fill({
          color: "rgba(43, 132, 204, 1)",
        }),
      }),
      text: new Text({
        text: length.toString(),
        scale: 1.5,
        fill: new Fill({
          color: "#fff",
        }),
      }),
    });
    clusterStyleCache[circleSize] = clusterStyle;
  }

  clusterStyle.getText()!.setText(length.toString());

  return clusterStyle;
}

export function detailMapStyleFunction(feature: Feature, highlighted: number[]): Style[] {
  const selected = highlighted !== undefined && highlighted.includes(feature.get("id") as number);

  const conf = {
    image: new Circle({
      radius: selected ? 10 : 6,
      fill: selected ? new Fill({ color: "rgba(255, 0, 0, 0.8)" }) : new Fill({ color: "rgba(0, 255, 0, 1)" }),
      stroke: new Stroke({ color: "black", width: 1 }),
    }),
  };

  return [new Style(conf)];
}
