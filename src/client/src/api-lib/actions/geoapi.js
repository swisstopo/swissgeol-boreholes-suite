import { fetch } from "./index";

export function getWms(language = "en", url) {
  return fetch(
    "/geoapi/wms/swisstopo",
    {
      action: "WMS_GETCAPABILITIES",
      params: {
        lang: language,
        name: "swisstopo",
        url: url,
      },
    },
    "get",
  );
}
