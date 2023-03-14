import adminUser from "../fixtures/adminUser.json";
import editorUser from "../fixtures/editorUser.json";
import viewerUser from "../fixtures/viewerUser.json";

export const adminUserAuth = {
  user: "admin",
  password: "swissforages",
};

export const interceptApiCalls = () => {
  // Api V1
  cy.intercept("/api/v1/borehole").as("borehole");
  cy.intercept("/api/v1/borehole/profile/layer").as("layer");
  cy.intercept("/api/v1/borehole/edit/files?id=**").as("download-file");
  cy.intercept("/api/v1/borehole/edit/files").as("files");
  cy.intercept("/api/v1/borehole/edit", req => {
    return (req.alias = `edit_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/user/edit", req => {
    return (req.alias = `user_edit_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/user", req => {
    return (req.alias = `user_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/workflow/edit", req => {
    return (req.alias = `workflow_edit_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/borehole/stratigraphy/layer/edit", req => {
    return (req.alias = `stratigraphy_layer_edit_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/borehole/stratigraphy/edit", req => {
    return (req.alias = `stratigraphy_edit_${req.body.action.toLowerCase()}`);
  });
  cy.intercept("/api/v1/setting").as("setting");
  cy.intercept("api/v1/borehole/codes").as("codes");

  // Api V2
  //cy.intercept("/api/v2/layer/**").as("layer-v2");
  cy.intercept("/api/v2/layer?profileId=**").as("layer-by-profileId");
  cy.intercept("/api/v2/location/identify**").as("location");
  cy.intercept("/api/v2/borehole/copy*").as("borehole_copy");
  cy.intercept("/api/v2/lithologicaldescription*").as(
    "lithological_description",
  );
  cy.intercept("/api/v2/chronostratigraphy*", req => {
    return (req.alias = `chronostratigraphy_${req.method}`);
  });
};

/**
 * Login into the application with the pre-filled user for the development environment.
 * @param {string} visitUrl The url to visit after logging in. Default is the root path.
 */
export const login = (visitUrl = "/") => {
  cy.intercept("api/v1/content").as("content");
  cy.intercept("/api/v1/borehole/codes").as("code");
  cy.visit(visitUrl);
  cy.wait("@content");
  cy.contains("button", "Login").click({ force: true });
  cy.wait("@code");
};

/**
 * Login into the application as admin.
 * @param {string} visitUrl The url to visit after logging in. Default is the root path.
 */
export const loginAsAdmin = (visitUrl = "/") => {
  cy.intercept("/api/v1/user", adminUser);
  login(visitUrl);
};

/**
 * Login into the application as editor.
 * @param {string} visitUrl The url to visit after logging in. Default is the root path.
 */
export const loginAsEditorInViewerMode = (visitUrl = "/") => {
  cy.intercept("/api/v1/user", editorUser);
  login(visitUrl);
};

/**
 * Login into the application as viewer.
 * @param {string} visitUrl The url to visit after logging in. Default is the root path.
 */
export const loginAsViewer = (visitUrl = "/") => {
  cy.intercept("/api/v1/user", viewerUser);
  login(visitUrl);
};

export const newEditableBorehole = () => {
  const id = newUneditableBorehole();
  cy.contains("a", "Start editing").click();
  cy.wait("@edit_lock");
  return id;
};

export const newUneditableBorehole = () => {
  login("/editor");
  cy.contains("a", "New").click();
  cy.contains("button", "Create").click();
  const id = waitForCreation();
  cy.wait(["@borehole", "@edit_list"]);
  return id;
};

const waitForCreation = () => {
  return cy.wait(["@edit_create"]).then(interception => {
    cy.task(
      "log",
      "Created new borehole with id:" + interception.response.body.id,
    );
    return cy.wrap(interception.response.body.id);
  });
};

export const createBorehole = values => {
  return cy
    .request({
      method: "POST",
      url: "/api/v1/borehole/edit",
      body: {
        action: "CREATE",
        id: 1,
      },
      auth: adminUserAuth,
    })
    .then(res => {
      expect(res.body).to.have.property("success", true);
      let boreholeId = res.body.id;
      let fields = Object.entries(values).map(([key, value]) => [key, value]);
      if (fields.length > 0) {
        cy.request({
          method: "POST",
          url: "/api/v1/borehole/edit",
          body: {
            action: "MULTIPATCH",
            fields: fields,
            ids: [boreholeId],
          },
          auth: adminUserAuth,
        }).then(res => expect(res.body).to.have.property("success", true));
      }
      return cy.wrap(boreholeId);
    });
};

export const createBoreholeLoginAsAdminInBoreHoleEditForm = values => {
  return createBorehole(values).then(value => loginAsAdmin(`/editor/${value}`));
};

export const deleteBorehole = id => {
  cy.request({
    method: "POST",
    url: "/api/v1/borehole/edit",
    body: {
      action: "DELETE",
      id: id,
    },
    auth: adminUserAuth,
  })
    .its("body.success")
    .should("eq", true);
};

export const loginAndResetState = () => {
  // Reset boreholes
  cy.request({
    method: "POST",
    url: "/api/v1/borehole/edit",
    body: {
      action: "IDS",
    },
    auth: adminUserAuth,
  }).then(response => {
    response.body.data
      .filter(id => id > 1009999) // max id in seed data.
      .forEach(id => {
        deleteBorehole(id);
      });
  });

  // Reset user settings (i.e. table ordering)
  cy.request({
    method: "POST",
    url: "/api/v2/user/resetAllSettings",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${btoa(
        `${adminUserAuth.user}:${adminUserAuth.password}`,
      )}`,
    },
  });
};

export const delayedType = (element, string) => {
  cy.wait(500);
  element.type(string, { delay: 10 });
};

// cy.Type() can be slow. If every keystroke triggers a request it can be even slower.
// Thus use setValueOfInputElement to set the value of the input element and only type one char after.
export const setValueOfInputElement = function (inputElement, inputValue) {
  inputElement[0].setAttribute("value", inputValue);
};
