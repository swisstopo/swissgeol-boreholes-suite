export function setAuthentication(user) {
  return {
    type: "SET_AUTHENTICATION",
    path: "/user",
    user: user,
  };
}

export function unsetAuthentication() {
  return {
    type: "UNSET_AUTHENTICATION",
    path: "/user",
  };
}
