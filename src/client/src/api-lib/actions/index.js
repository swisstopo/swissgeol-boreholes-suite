import axios from "axios";
import store from "../reducers";

function getAuthorizationHeaders(headers = {}) {
  if (
    store.getState() &&
    store.getState().hasOwnProperty("core_user") &&
    store.getState().core_user.authentication !== null
  ) {
    const a = store.getState().core_user.authentication;
    headers.Authorization = `Basic ${btoa(`${a.username}:${a.password}`)}`;
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

export function downloadFile(path, params) {
  return new Promise((resolve, reject) => {
    return axios(process.env.PUBLIC_URL + path, {
      timeout: 120000,
      responseType: "blob",
      headers: getAuthorizationHeaders(),
      params: params,
    })
      .then(response => {
        const fileName = response.headers["content-disposition"]
          .split("; ")[1]
          .replace("filename=", "");
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        resolve(response);
      })
      .catch(function (error) {
        debugger;
        reject(error);
      });
  });
}

export function downloadFilePost(path, action) {
  return new Promise((resolve, reject) => {
    return axios(
      path.includes("http://") || path.includes("https://")
        ? path
        : process.env.PUBLIC_URL + "/api/v1" + path,
      {
        timeout: 120000,
        responseType: "blob",
        headers: getAuthorizationHeaders(),
        data: action,
        method: "POST",
      },
    )
      .then(response => {
        if (response.headers["content-type"].includes("application/json")) {
          let fileReader = new FileReader();
          fileReader.onload = function () {
            resolve(JSON.parse(this.result));
          };
          fileReader.readAsText(new Blob([response.data]));
        } else {
          const fileName = response.headers["content-disposition"]
            .split("; ")[1]
            .replace("filename=", "");
          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", fileName);
          document.body.appendChild(link);
          link.click();
          resolve(response);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
}

export function downloadBorehole(params) {
  return downloadFile("/api/v1/borehole/download", params);
}

export function downloadAttachment(params) {
  return downloadFile("/api/v1/borehole/edit/files", params);
}

export function fetch(path, action, method = "post", auth = null) {
  const conf = {
    url:
      path.includes("http://") || path.includes("https://")
        ? path
        : process.env.PUBLIC_URL + "/api/v1" + path,
    headers: getAuthorizationHeaders(),
    timeout: 120000,
    method: method,
  };
  if (auth !== null) {
    conf["auth"] = auth;
  }
  if (action.hasOwnProperty("action")) {
    if (method === "post") {
      conf["responseType"] = "json";
      conf["data"] = action;
    } else if (method === "get") {
      conf["responseType"] = "xml";
      if (action.hasOwnProperty("params")) {
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
        if (action.hasOwnProperty("params")) {
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
            debugger;
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

export function uploadFile(path, action, file) {
  const data = new FormData();
  data.append("file", file);
  for (var property in action) {
    if (action.hasOwnProperty(property)) {
      data.append(property, action[property]);
    }
  }
  return axios.post(
    path.includes("http://") || path.includes("https://")
      ? path
      : process.env.PUBLIC_URL + "/api/v1" + path,
    data,
    {
      // merge headers
      headers: getAuthorizationHeaders({
        "content-type": "multipart/form-data",
      }),
    },
  );
}
