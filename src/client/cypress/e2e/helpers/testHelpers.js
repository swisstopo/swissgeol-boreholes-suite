import adminUser from "../../fixtures/adminUser.json";
import editorUser from "../../fixtures/editorUser.json";
import viewerUser from "../../fixtures/viewerUser.json";

export const bearerAuth = token => ({ bearer: token });

export const interceptApiCalls = () => {
  // Api V1
  cy.intercept("/api/v1/borehole").as("borehole");
  cy.intercept("/api/v1/borehole/profile/layer").as("layer");
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
  cy.intercept("/api/v1/setting").as("setting");
  cy.intercept("api/v1/borehole/codes").as("codes");

  // Api V2
  cy.intercept("/api/v2/layer?profileId=**").as("get-layers-by-profileId");
  cy.intercept("GET", "/api/v2/layer/**").as("get-layer-by-id");
  cy.intercept("PUT", "/api/v2/layer").as("update-layer");
  cy.intercept("/api/v2/location/identify**").as("location");
  cy.intercept("/api/v2/borehole/copy*").as("borehole_copy");
  cy.intercept("/api/v2/lithologicaldescription*").as("lithological_description");
  cy.intercept("/api/v2/chronostratigraphy*", req => {
    return (req.alias = `chronostratigraphy_${req.method}`);
  });

  cy.intercept("/api/v2/lithostratigraphy*", req => {
    return (req.alias = `lithostratigraphy_${req.method}`);
  });

  cy.intercept("/api/v2/wateringress*", req => {
    return (req.alias = `wateringress_${req.method}`);
  });

  cy.intercept("/api/v2/groundwaterlevelmeasurement*", req => {
    return (req.alias = `groundwaterlevelmeasurement_${req.method}`);
  });

  cy.intercept("/api/v2/fieldmeasurement*", req => {
    return (req.alias = `fieldmeasurement_${req.method}`);
  });

  cy.intercept("/api/v2/hydrotest*", req => {
    return (req.alias = `hydrotest_${req.method}`);
  });

  cy.intercept("/api/v2/completion?boreholeId=**").as("get-completions-by-boreholeId");

  cy.intercept("/api/v2/casing*", req => {
    return (req.alias = `casing_${req.method}`);
  });

  cy.intercept("/api/v2/instrumentation*", req => {
    return (req.alias = `instrumentation_${req.method}`);
  });

  cy.intercept("/api/v2/backfill*", req => {
    return (req.alias = `backfill_${req.method}`);
  });

  cy.intercept("/api/v2/codelist*", req => {
    return (req.alias = `codelist_${req.method}`);
  });

  cy.intercept("/api/v2/stratigraphy*", req => {
    return (req.alias = `stratigraphy_${req.method}`);
  });
};

/**
 * Login into the application with the user for the development environment.
 */
export const login = user => {
  cy.session(
    ["login", user],
    () => {
      cy.intercept("http://localhost:4011/connect/token").as("token");
      cy.visit("/");
      cy.origin("http://localhost:4011", { args: { user } }, ({ user }) => {
        cy.get("#Username").type(user);
        cy.get("#Password").type("swissforages");
        cy.contains("button", "Login").click({ force: true });
      });
      cy.wait("@token")
        .then(interception => interception.response.body.id_token)
        .then(token => window.localStorage.setItem("id_token", token));
    },
    {
      validate() {
        cy.window()
          .then(win => win.localStorage.getItem("id_token"))
          .as("id_token");
        cy.get("@id_token").then(token =>
          cy.request({
            method: "POST",
            url: "/api/v1/user",
            body: {
              action: "GET",
            },
            auth: bearerAuth(token),
          }),
        );
      },
      cacheAcrossSpecs: true,
    },
  );
};

/**
 * Login into the application as admin.
 */
export const loginAsAdmin = () => {
  login("admin");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(adminUser),
  }).as("stubAdminUser");
};

/**
 * Login into the application as editor.
 */
export const loginAsEditor = () => {
  login("editor");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(editorUser),
  }).as("stubEditorUser");
};

/**
 * Login into the application as viewer.
 */
export const loginAsEditorInViewerMode = () => {
  login("editor");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(viewerUser),
  }).as("stubViewerUser");
};

export const newEditableBorehole = () => {
  const id = newUneditableBorehole();
  cy.contains("a", "Start editing").click();
  cy.wait("@edit_lock");
  return id;
};

export const newUneditableBorehole = () => {
  loginAsAdmin();
  cy.visit("/editor");
  cy.contains("a", "New").click();
  cy.contains("button", "Create").click();
  const id = waitForCreation();
  cy.wait(["@borehole", "@edit_list"]);
  return id;
};

const waitForCreation = () => {
  return cy.wait(["@edit_create"]).then(interception => {
    cy.task("log", "Created new borehole with id:" + interception.response.body.id);
    return cy.wrap(interception.response.body.id);
  });
};

export const createBorehole = values => {
  loginAsAdmin();
  return cy.get("@id_token").then(token =>
    cy
      .request({
        method: "POST",
        url: "/api/v1/borehole/edit",
        body: {
          action: "CREATE",
          id: 1,
        },
        auth: bearerAuth(token),
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
            auth: bearerAuth(token),
          }).then(res => expect(res.body).to.have.property("success", true));
        }
        return cy.wrap(boreholeId);
      }),
  );
};

export const createAndEditBoreholeAsAdmin = values => {
  return createBorehole(values).then(value => {
    loginAsAdmin();
    cy.visit(`/editor/${value}`);
  });
};

export const startBoreholeEditing = () => {
  cy.contains("a", "Start editing").click();
  cy.wait("@edit_lock");
};

export const deleteBorehole = id => {
  loginAsAdmin();
  cy.get("@id_token").then(token => {
    cy.request({
      method: "POST",
      url: "/api/v1/borehole/edit",
      body: {
        action: "DELETE",
        id: id,
      },
      auth: bearerAuth(token),
    })
      .its("body.success")
      .should("eq", true);
  });
};

export const loginAndResetState = () => {
  loginAsAdmin();
  cy.get("@id_token").then(token => {
    // Reset boreholes
    cy.request({
      method: "POST",
      url: "/api/v1/borehole/edit",
      body: {
        action: "IDS",
      },
      auth: bearerAuth(token),
    }).then(response => {
      response.body.data
        .filter(id => id > 1002999) // max id in seed data.
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
      auth: bearerAuth(token),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
};

export const delayedType = (element, string) => {
  cy.wait(500);
  element.type(string, { delay: 10 });
};

/**
 * Sets the value for a provided input element.
 *
 * cy.Type() can be slow. If every keystroke triggers a request it can be even slower.
 * Thus use setValueOfInputElement to set the value of the input element and only type one char after.
 * @param {object} inputElement The input element.
 * @param {string} inputValue The input string to set as value.
 */
export const setValueOfInputElement = function (inputElement, inputValue) {
  inputElement[0].setAttribute("value", inputValue);
};

// Deletes a downloaded file in Cypress' downloads folder
export const deleteDownloadedFile = fileName => {
  // Get the path to the downloaded file you want to delete
  let filePath = "cypress/downloads/" + fileName;

  // Set the command in case of linux os
  let command = "rm -f";

  // Override the command and path in case of windows os
  if (Cypress.platform === "win32") {
    command = "del";
    filePath = "cypress\\downloads\\" + fileName;
  }

  cy.exec(`${command} ${filePath}`).then(result => {
    // Check if the command executed successfully
    expect(result.code).to.equal(0);

    // Check that the file has been deleted
    cy.readFile(filePath, { log: false }).should("not.exist");
  });
};

// Read the downloaded file in Cypress' downloads folder
export const readDownloadedFile = fileName => {
  // Get the path to the downloaded file you want to read
  let filePath = "cypress/downloads/" + fileName;

  // Override the path in case of windows os
  if (Cypress.platform === "win32") {
    filePath = "cypress\\downloads\\" + fileName;
  }

  cy.readFile(filePath);
};

// Get the file to import from the fixtures folder
export const getImportFileFromFixtures = (fileName, encoding, dataSet) => {
  // Define the path to the file
  let filePath = "/import/";
  if (dataSet) {
    filePath = filePath + "/data-sets/" + dataSet + "/";
  }
  filePath = filePath + fileName;

  // Override the path in case of windows os
  if (Cypress.platform === "win32") {
    if (dataSet) {
      filePath = "\\import\\data-sets\\" + dataSet + "\\" + fileName;
    } else {
      filePath = "\\import\\" + fileName;
    }
  }

  return cy.fixture(filePath, { encoding: encoding });
};

export const createStratigraphy = (boreholeId, kindId) => {
  cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/stratigraphy",
      body: {
        boreholeId: boreholeId,
        kindId: kindId,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createCompletion = (name, boreholeId, kindId, isPrimary) => {
  cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/completion",
      body: {
        name: name,
        boreholeId: boreholeId,
        kindId: kindId,
        isPrimary: isPrimary,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const handlePrompt = (title, action) => {
  cy.get('[data-cy="prompt"]').should("exist");
  cy.contains(title);
  cy.get('[data-cy="prompt-button-' + action + '"]').click();
};
