import { ObservationType } from "../../../src/pages/detail/form/hydrogeology/Observation.ts";
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
  cy.intercept("/api/v2/export/csv**").as("borehole_export_csv");
  cy.intercept("/api/v2/borehole/**").as("borehole_by_id");
  cy.intercept("PUT", "/api/v2/borehole").as("update-borehole");
  cy.intercept("PUT", "/api/v2/user").as("update-user");
  cy.intercept("GET", "/api/v2/user").as("get-user");
  cy.intercept("PUT", "/api/v2/workgroup").as("update-workgroup");

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
  cy.intercept("/api/v2/import/*").as("borehole-upload");
  cy.intercept("/api/v2/boreholefile/getAllForBorehole?boreholeId=**").as("getAllAttachments");
  cy.intercept("/api/v2/boreholefile/upload?boreholeId=**").as("upload-files");
  cy.intercept("/api/v2/boreholefile/download?boreholeFileId=**").as("download-file");
  cy.intercept("/api/v2/boreholefile/detachFile?boreholeId=**&boreholeFileId=**").as("delete-file");
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
  cy.get('[data-cy="accept-button"]').click();
};

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

export function giveAdminUser1workgroup() {
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(adminUser),
  }).as("adminUser1Workgroups");
}

export function giveAdminUser2workgroups() {
  const adminUser2Workgroups = Object.assign({}, adminUser);
  adminUser2Workgroups.data.workgroups.push({
    id: 6,
    workgroup: "Blue",
    roles: ["EDIT"],
    disabled: null,
  });
  cy.intercept("/api/v1/user", {
    statusCode: 200,
    body: JSON.stringify(adminUser2Workgroups),
  }).as("adminUser2Workgroups");
}

export const newEditableBorehole = () => {
  const id = newUneditableBorehole();
  startBoreholeEditing();
  return id;
};

export const newUneditableBorehole = () => {
  cy.get('[data-cy="new-borehole-button"]').click();
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

export const createBorehole = values => {
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

export const startBoreholeEditing = () => {
  startEditing("detail-header");
  cy.wait("@edit_lock");
};

export const stopBoreholeEditing = () => {
  stopEditing();
  cy.wait("@edit_unlock");
};

export const returnToOverview = () => {
  cy.get('[data-cy="backButton"]').click();
  cy.wait(["@edit_list", "@borehole"]);
};

export const getElementByDataCy = attribute => {
  return cy.get(`[data-cy=${attribute}]`);
};

export const checkElementColorByDataCy = (attribute, expectedColor) => {
  getElementByDataCy(attribute).should("have.css", "color", expectedColor);
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
  const filePath = Cypress.platform === "win32" ? `cypress\\downloads\\${fileName}` : `cypress/downloads/${fileName}`;

  // If file exists in download folder, delete it.
  cy.task("fileExistsInDownloadFolder", filePath).then(exists => {
    if (exists) {
      // Set the command to delete the file based on the OS
      const command = Cypress.platform === "win32" ? "del" : "rm -f";

      cy.exec(`${command} ${filePath}`).then(result => {
        // Check if the command executed successfully
        expect(result.code).to.equal(0);

        // Check that the file has been deleted
        cy.readFile(filePath, { log: false, timeout: 10000 }).should("not.exist");
      });
    }
  });
};

export const prepareDownloadPath = fileName => {
  // Get the path to the downloaded file you want to read
  let filePath = "cypress/downloads/" + fileName;

  // Override the path in case of windows os
  if (Cypress.platform === "win32") {
    filePath = "cypress\\downloads\\" + fileName;
  }
  return filePath;
};

// Read the downloaded file in Cypress' downloads folder
export const readDownloadedFile = fileName => {
  let filePath = prepareDownloadPath(fileName);

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
  return cy.get("@id_token").then(token => {
    return cy
      .request({
        method: "POST",
        url: "/api/v2/stratigraphy",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          boreholeId: boreholeId,
          kindId: kindId,
        },
        auth: bearerAuth(token),
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

export const createLithologyLayer = (stratigraphyId, layer) => {
  return cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/layer",
      cache: "no-cache",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: {
        stratigraphyId: stratigraphyId,
        ...layer,
      },
      auth: bearerAuth(token),
    });
  });
};

export const createCompletion = (name, boreholeId, kindId, isPrimary) => {
  return cy.get("@id_token").then(token => {
    return cy
      .request({
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
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

export const createCasing = (name, boreholeId, completionId, dateStart, dateFinish, casingElements) => {
  return cy.get("@id_token").then(token => {
    return cy
      .request({
        method: "POST",
        url: "/api/v2/casing",
        body: {
          name: name,
          boreholeId: boreholeId,
          completionId: completionId,
          dateStart: dateStart,
          dateFinish: dateFinish,
          casingElements: casingElements,
        },
        cache: "no-cache",
        credentials: "same-origin",
        auth: bearerAuth(token),
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

export const createFieldMeasurement = (
  boreholeId,
  startTime,
  reliabilityId,
  sampleTypeId,
  parameterId,
  value,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
) => {
  return cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/fieldmeasurement",
      body: {
        boreholeId: boreholeId,
        startTime: startTime,
        reliabilityId: reliabilityId,
        fieldMeasurementResults: [{ sampleTypeId: sampleTypeId, parameterId, value: value }],
        casingId: casingId,
        fromDepthM: fromDepthM,
        toDepthM: toDepthM,
        type: ObservationType.fieldMeasurement,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createWateringress = (
  boreholeId,
  startTime,
  reliabilityId,
  quantityId,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
) => {
  return cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/wateringress",
      body: {
        boreholeId: boreholeId,
        startTime: startTime,
        reliabilityId: reliabilityId,
        quantityId: quantityId,
        casingId: casingId,
        fromDepthM: fromDepthM,
        toDepthM: toDepthM,
        type: ObservationType.waterIngress,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createGroundwaterLevelMeasurement = (
  boreholeId,
  startTime,
  reliabilityId,
  kindId,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
) => {
  return cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/groundwaterlevelmeasurement",
      body: {
        boreholeId: boreholeId,
        startTime: startTime,
        reliabilityId: reliabilityId,
        kindId: kindId,
        casingId: casingId,
        fromDepthM: fromDepthM,
        toDepthM: toDepthM,
        type: ObservationType.groundwaterLevelMeasurement,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createHydrotest = (
  boreholeId,
  startTime,
  reliabilityId,
  kindCodelistIds,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
) => {
  return cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/hydrotest",
      body: {
        boreholeId: boreholeId,
        startTime: startTime,
        reliabilityId: reliabilityId,
        kindCodelistIds: kindCodelistIds,
        casingId: casingId,
        fromDepthM: fromDepthM,
        toDepthM: toDepthM,
        type: ObservationType.hydrotest,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createBackfill = (completionId, casingId, materialId, kindId, fromDepth, toDepth, notes) => {
  cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/backfill",
      body: {
        completionId: completionId,
        casingId: casingId,
        materialId: materialId,
        kindId: kindId,
        fromDepth: fromDepth,
        toDepth: toDepth,
        notes: notes,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const createInstrument = (completionId, casingId, name, statusId, kindId, fromDepth, toDepth, notes) => {
  cy.get("@id_token").then(token => {
    return cy.request({
      method: "POST",
      url: "/api/v2/instrumentation",
      body: {
        completionId: completionId,
        casingId: casingId,
        name: name,
        statusId: statusId,
        kindId: kindId,
        fromDepth: fromDepth,
        toDepth: toDepth,
        notes: notes,
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
};

export const handlePrompt = (message, action) => {
  cy.get('[data-cy="prompt"]').should("be.visible");
  cy.contains(message);
  cy.get('[data-cy="prompt"]').find(`[data-cy="${action.toLowerCase()}-button"]`).click();
};

export const createBaseSelector = parent => {
  if (parent) {
    return `[data-cy="${parent}"] `;
  } else {
    return "";
  }
};

export const selectLanguage = language => {
  cy.get('[data-cy="language-button-select"]').click({ force: true });
  cy.get(`[data-cy="${language.toLowerCase()}-button-select-item"]`).click({ force: true });
  cy.wait(1000);
};

export const selectInputFile = (fileName, mimeType) => {
  const crypto = window.crypto || window.msCrypto;
  const content = crypto.getRandomValues(new Uint32Array(1)).toString();

  cy.get("input[type=file]").selectFile(
    {
      contents: Cypress.Buffer.from(content),
      fileName: fileName,
      mimeType: mimeType,
    },
    { force: true },
  );
  cy.wait(1000);
};
