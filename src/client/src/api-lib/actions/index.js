import axios from "axios";

export function getHeight(easting, northing) {
  return axios.get("https://api3.geo.admin.ch/rest/services/height", {
    params: {
      easting: easting,
      northing: northing,
      sr: 2056,
    },
  });
}
