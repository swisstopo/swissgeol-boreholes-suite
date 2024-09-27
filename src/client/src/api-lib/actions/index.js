import axios from "axios";
import { getAuthorizationHeader } from "../../api/authentication";
import store from "../reducers";

function getAuthorizationHeaders(headers = {}) {
  if (
    store.getState() &&
    Object.prototype.hasOwnProperty.call(store.getState(), "core_user") &&
    store.getState().core_user.authentication !== null
  ) {
    const authentication = store.getState().core_user.authentication;
    headers.Authorization = getAuthorizationHeader(authentication);
    headers["bdms-authorization"] = "bdms-v1";
  }
  return headers;
}

export function getHeight(easting, northing) {
  return axios.get("https://api3.geo.admin.ch/rest/services/height", {
    params: {
      easting: easting,
      northing: northing,
      sr: 2056,
    },
  });
}

export function fetch(path, action, method = "post", auth = null) {
  const conf = {
    url: path.includes("http://") || path.includes("https://") ? path : "/api/v1" + path,
    headers: getAuthorizationHeaders(),
    timeout: 120000,
    method: method,
  };
  if (auth !== null) {
    conf["auth"] = auth;
  }
  if (Object.prototype.hasOwnProperty.call(action, "action")) {
    if (method === "post") {
      conf["responseType"] = "json";
      conf["data"] = action;
    } else if (method === "get") {
      conf["responseType"] = "xml";
      if (Object.prototype.hasOwnProperty.call(action, "params")) {
        conf["params"] = action.params;
      }
    }
    return axios(conf);
  } else {
    return function (dispatch = function () {}) {
      dispatch({
        path: path,
        ...action,
      });
      if (method === "post") {
        conf["responseType"] = "json";
        const json = {};
        for (var key in action) {
          if (key === "type") {
            json.action = action[key];
          } else {
            json[key] = action[key];
          }
        }
        conf["data"] = json;
      } else if (method === "get") {
        conf["responseType"] = "xml";
        if (Object.prototype.hasOwnProperty.call(action, "params")) {
          conf["params"] = action.params;
        }
      }
      return new Promise((resolve, reject) => {
        return axios(conf)
          .then(response => {
            if (response.data.success === true) {
              dispatch({
                type: action.type + "_OK",
                path: path,
                json: response.data,
                status: response.status,
                message: response.statusText,
              });
            } else {
              if (action.type !== "GET" && path !== "/user") {
                alert(response.data.message);
              }
              dispatch({
                type: action.type + "_ERROR",
                path: path,
                json: response.data,
                status: response.status,
                message: response.statusText,
              });
            }
            resolve(response.data, dispatch);
          })
          .catch(function (error) {
            dispatch({
              type: action.type + "_CONNECTION_ERROR",
              path: path,
              error: error,
            });
            reject(error, dispatch);
          });
      });
    };
  }
}
