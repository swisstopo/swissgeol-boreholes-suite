import { fetch } from "./index";

export function getWmts(language = "en") {
  return fetch(
    "/geoapi/wmts",
    {
      action: "WMTS_GETCAPABILITIES",
      params: {
        lang: language,
      },
    },
    "get",
  );
}

// export function getWms(language = 'en', auth = null){
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
    "get", //, auth
  );
}
