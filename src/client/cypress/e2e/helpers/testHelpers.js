import adminUser from "../../fixtures/adminUser.json";
import editorUser from "../../fixtures/editorUser.json";
import viewerUser from "../../fixtures/viewerUser.json";
import { startEditing, stopEditing } from "./buttonHelpers.js";

export const bearerAuth = token => ({ bearer: token });

export const interceptApiCalls = () => {
  // Api V1
  cy.intercept("/api/v1/borehole").as("borehole");
  cy.intercept("/api/v1/borehole", req => {
    return (req.alias = `borehole_${req.body.action.toLowerCase()}`);
  });
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
  cy.intercept("/api/v2/borehole/**").as("borehole_by_id");
  cy.intercept("PUT", "/api/v2/borehole").as("update-borehole");

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

  cy.intercept("/api/v2/casing?completionId=**").as("get-casings-by-completionId");

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

  cy.intercept("/api/v2/section?boreholeId=**").as("get-sections-by-boreholeId");

  cy.intercept("/api/v2/section*", req => {
    return (req.alias = `section_${req.method}`);
  });

  cy.intercept("/api/v2/boreholegeometry?boreholeId=**", req => {
    return (req.alias = `boreholegeometry_${req.method}`);
  });

  cy.intercept("/api/v2/boreholefile/getAllForBorehole?boreholeId=**").as("get-borehole-files");
  cy.intercept("/api/v2/boreholefile/getDataExtractionFileInfo*").as("extraction-file-info");
  cy.intercept({
    method: "GET",
    url: "/api/v2/boreholefile/dataextraction/*",
  }).as("dataextraction");
  cy.intercept({
    method: "GET",
    url: "/api/v2/boreholefile/dataextraction/*",
  }).as("load-extraction-file");
  cy.intercept("dataextraction/api/V1/extract_data").as("extract-data");

  cy.intercept("https://api3.geo.admin.ch/rest/services/height*").as("height");
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
export const goToRouteAndAcceptTerms = route => {
  cy.visit(route);
  selectByDataCyAttribute("accept-button").click();
};

export const loginAsAdmin = (route = "/") => {
  login("admin");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(adminUser),
  }).as("stubAdminUser");
  goToRouteAndAcceptTerms(route);
};

/**
 * Login into the application as editor.
 */
export const loginAsEditor = (route = "/") => {
  login("editor");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(editorUser),
  }).as("stubEditorUser");
  goToRouteAndAcceptTerms(route);
};

/**
 * Login into the application as viewer.
 */
export const loginAsViewer = (route = "/") => {
  login("viewer");
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(viewerUser),
  }).as("stubViewerUser");
  goToRouteAndAcceptTerms(route);
};

export const newEditableBorehole = () => {
  const id = newUneditableBorehole();
  startBoreholeEditing();
  return id;
};

export const newUneditableBorehole = () => {
  selectByDataCyAttribute("new-borehole-button").click();
  cy.contains("button", "Create").click();
  const id = waitForCreation();
  cy.wait(["@borehole", "@borehole_by_id"]);
  return id;
};

const waitForCreation = () => {
  return cy.wait(["@edit_create"]).then(interception => {
    cy.task("log", "Created new borehole with id:" + interception.response.body.id);
    return cy.wrap(interception.response.body.id);
  });
};

export const startBoreholeEditing = () => {
  startEditing("detail-header");
  cy.wait("@edit_lock");
};

export const stopBoreholeEditing = () => {
  stopEditing();
  cy.wait("@edit_unlock");
};

export const returnToOverview = () => {
  selectByDataCyAttribute("backButton").click();
  cy.wait(["@edit_list", "@borehole"]);
};

export const deleteBorehole = id => {
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

  // If file exists in download folder, delete it.
  cy.task("fileExistsInDownloadFolder", "languages/en.yml").then(exists => {
    if (exists) {
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
    }
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

export const handlePrompt = (message, action) => {
  selectByDataCyAttribute("prompt").should("be.visible");
  cy.contains(message);
  selectByDataCyAttribute("prompt").find(`[data-cy="${action.toLowerCase()}-button"]`).click();
};

export const createBaseSelector = parent => {
  if (parent) {
    return `[data-cy="${parent}"] `;
  } else {
    return "";
  }
};

export const selectByDataCyAttribute = attribute => {
  return cy.get(`[data-cy="${attribute}"]`);
};

export const selectByDataCyAttributeStartingWith = attribute => {
  return cy.get(`[data-cy^="${attribute}"]`);
};

export const selectLanguage = language => {
  selectByDataCyAttribute("language-button-select").click({ force: true });
  cy.get(`[data-cy="${language.toLowerCase()}-button-select-item"]`).click({ force: true });
  cy.wait(1000);
};
