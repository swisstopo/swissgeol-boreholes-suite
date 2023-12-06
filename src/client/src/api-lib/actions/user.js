import { fetch } from "./index";

export function setAuthentication(
  username,
  password,
  authentication = "basic",
) {
  return {
    type: "SET_AUTHENTICATION",
    path: "/user",
    username: username,
    password: password,
    authentication: authentication,
  };
}

export function unsetAuthentication() {
  return {
    type: "UNSET_AUTHENTICATION",
    path: "/user",
  };
}

export function loadUser() {
  return fetch("/user", {
    type: "GET",
  });
}

export function reloadUser() {
  return fetch("/user", {
    type: "RELOAD",
  });
}

export function createUser(
  username,
  password,
  firstname = "",
  middlename = "",
  lastname = "",
  admin = false,
) {
  return fetch("/user/edit", {
    action: "CREATE",
    username: username,
    password: password,
    firstname: firstname,
    middlename: middlename,
    lastname: lastname,
    admin: admin,
  });
}

export function updateUser(
  id,
  username,
  password,
  firstname = "",
  middlename = "",
  lastname = "",
  admin = false,
) {
  return fetch("/user/edit", {
    action: "UPDATE",
    user_id: id,
    username: username,
    password: password,
    firstname: firstname,
    middlename: middlename,
    lastname: lastname,
    admin: admin,
  });
}

export function enableUser(id) {
  return fetch("/user/edit", {
    action: "ENABLE",
    id: id,
  });
}

export function disableUser(id) {
  return fetch("/user/edit", {
    action: "DISABLE",
    id: id,
  });
}

export function deleteUser(id) {
  return fetch("/user/edit", {
    action: "DELETE",
    id: id,
  });
}
