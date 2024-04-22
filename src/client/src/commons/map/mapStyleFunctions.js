import { Circle, Fill, RegularShape, Stroke, Style, Text } from "ol/style";

const boreholeStyleCache = {};
const virtualBoreholeStyleCache = {};
const trialpitStyleCache = {};
const probingStyleCache = {};
const deepBoreholeStyleCache = {};
const otherStyleCache = {};
const clusterStyleCache = {};

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

export function styleFunction(feature, highlighted) {
  let selected = highlighted !== undefined && highlighted.length > 0 && highlighted.indexOf(feature.getId()) > -1;
  let res = feature.get("restriction");
  let fill = null;
  if (res === "f") {
    fill = greenFill;
  } else if (["b", "g"].indexOf(res) >= 0) {
    fill = redFill;
  } else {
    fill = blackFill;
  }

  let conf = null;
  let kind = feature.get("kind");
  if (kind === "B") {
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

    conf = {
      image: image,
    };
  } else if (kind === "V") {
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

    conf = {
      image: image,
    };
  } else if (kind === "SS") {
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

    conf = {
      image: image,
    };
  } else if (kind === "RS") {
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

    conf = {
      image: image,
    };
  } else if (kind === "a") {
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

    conf = {
      image: image,
    };
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

    conf = {
      image: image,
    };
  }

  if (selected) {
    return [innerSelectedStyle, outerSelectedStyle, new Style(conf)];
  }

  return [new Style(conf)];
}

export function clusterStyleFunction(length) {
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

  clusterStyle.text_.text_ = length.toString();

  return clusterStyle;
}

export function detailMapStyleFunction(feature, highlighted) {
  let selected = highlighted !== undefined && highlighted.indexOf(feature.getId()) > -1;

  let conf = {
    image: new Circle({
      radius: selected ? 10 : 6,
      fill: selected ? new Fill({ color: "rgba(255, 0, 0, 0.8)" }) : new Fill({ color: "rgba(0, 255, 0, 1)" }),
      stroke: new Stroke({ color: "black", width: 1 }),
    }),
  };

  return [new Style(conf)];
}
