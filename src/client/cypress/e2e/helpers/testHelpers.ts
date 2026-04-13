import { restrictionFreeCode } from "../../../src/components/codelist.ts";
import { ObservationType } from "../../../src/pages/detail/form/hydrogeology/Observation.ts";
import adminUser from "../../fixtures/adminUser.json";
import editorUser from "../../fixtures/editorUser.json";
import viewerUser from "../../fixtures/viewerUser.json";
import { startEditing, stopEditing } from "./buttonHelpers";

export const bearerAuth = (token: string) => ({ bearer: token });

export const interceptApiCalls = () => {
  // Api V1
  cy.intercept("/api/v1/borehole").as("borehole");
  cy.intercept("/api/v1/borehole", req => {
    req.alias = `borehole_${req.body.action.toLowerCase()}`;
  });
  cy.intercept("/api/v1/borehole/edit", req => {
    req.alias = `edit_${req.body.action.toLowerCase()}`;
  });
  cy.intercept("/api/v1/user/edit", req => {
    req.alias = `user_edit_${req.body.action.toLowerCase()}`;
  });
  cy.intercept("/api/v1/user", req => {
    req.alias = `user_${req.body.action.toLowerCase()}`;
  });
  cy.intercept("/api/v1/workflow/edit", req => {
    req.alias = `workflow_edit_${req.body.action.toLowerCase()}`;
  });
  cy.intercept("/api/v1/setting").as("setting");
  cy.intercept("api/v1/borehole/codes").as("codes");

  // Api V2
  cy.intercept("/api/v2/stratigraphy?boreholeId=**").as("stratigraphy_by_borehole_GET");
  cy.intercept("/api/v2/stratigraphy*", req => {
    req.alias = `stratigraphy_${req.method}`;
  });
  cy.intercept("/api/v2/stratigraphy/copy*").as("stratigraphy_COPY");
  cy.intercept("/api/v2/lithology?stratigraphyId=**").as("lithology_by_stratigraphyId_GET");
  cy.intercept("/api/v2/location/identify**").as("location");
  cy.intercept("/api/v2/borehole/copy*").as("borehole_copy");
  cy.intercept("/api/v2/export/csv**").as("borehole_export_csv");
  cy.intercept("/api/v2/export/json**").as("borehole_export_json");
  cy.intercept("/api/v2/borehole/**").as("borehole_by_id");
  cy.intercept("PUT", "/api/v2/borehole").as("update-borehole");
  cy.intercept("POST", "/api/v2/borehole").as("post-borehole");
  cy.intercept("PUT", "/api/v2/user").as("update-user");
  cy.intercept("GET", "/api/v2/user").as("get-user");
  cy.intercept("GET", "/api/v2/user/self").as("get-current-user");
  cy.intercept("PUT", "/api/v2/workgroup").as("update-workgroup");
  cy.intercept("POST", "/api/v2/workgroup/setRoles").as("set_workgroup_roles");
  cy.intercept("POST", "/api/v2/workflow/tabstatuschange").as("tabstatuschange");
  cy.intercept("GET", "/api/v2/workflow/**").as("workflow_by_id");
  cy.intercept("/api/v2/lithologicaldescription*").as("lithological_description");
  cy.intercept("/api/v2/lithologicaldescription?stratigraphyId=**").as("lithologicaldescription_by_stratigraphyId_GET");

  cy.intercept("/api/v2/faciesdescription*").as("facies_description");

  cy.intercept("/api/v2/chronostratigraphy*", req => {
    req.alias = `chronostratigraphy_${req.method}`;
  });

  cy.intercept("/api/v2/lithostratigraphy*", req => {
    req.alias = `lithostratigraphy_${req.method}`;
  });

  cy.intercept("/api/v2/wateringress*", req => {
    req.alias = `wateringress_${req.method}`;
  });

  cy.intercept("/api/v2/groundwaterlevelmeasurement*", req => {
    req.alias = `groundwaterlevelmeasurement_${req.method}`;
  });

  cy.intercept("/api/v2/fieldmeasurement*", req => {
    req.alias = `fieldmeasurement_${req.method}`;
  });

  cy.intercept("/api/v2/hydrotest*", req => {
    req.alias = `hydrotest_${req.method}`;
  });

  cy.intercept("/api/v2/completion?boreholeId=**").as("completion_GET");
  cy.intercept("DELETE", "/api/v2/completion?id=**").as("completion_DELETE");

  cy.intercept("/api/v2/casing?completionId=**").as("casing_by_completion_GET");
  cy.intercept("/api/v2/casing?boreholeId=**").as("casing_by_borehole_GET");
  cy.intercept("/api/v2/casing*", req => {
    req.alias = `casing_${req.method}`;
  });

  cy.intercept("/api/v2/instrumentation?completionId=**").as("instrumentation_by_completion_GET");
  cy.intercept("/api/v2/instrumentation*", req => {
    req.alias = `instrumentation_${req.method}`;
  });

  cy.intercept("/api/v2/backfill?completionId=**").as("backfill_by_completion_GET");
  cy.intercept("/api/v2/backfill*", req => {
    req.alias = `backfill_${req.method}`;
  });

  cy.intercept("/api/v2/codelist?schema=**").as("codelist_by_schema_GET");
  cy.intercept("/api/v2/codelist?testKindIds=**").as("codelist_by_testKindIds_GET");
  cy.intercept("/api/v2/codelist*", req => {
    req.alias = `codelist_${req.method}`;
  });

  cy.intercept("/api/v2/section?boreholeId=**").as("section_GET");
  cy.intercept("POST", "/api/v2/section").as("section_POST");
  cy.intercept("PUT", "/api/v2/section").as("section_PUT");
  cy.intercept("DELETE", "/api/v2/section?id=**").as("section_DELETE");

  cy.intercept("/api/v2/boreholegeometry?boreholeId=**", req => {
    req.alias = `boreholegeometry_${req.method}`;
  });
  cy.intercept("/api/v2/boreholegeometry/geometryformats", req => {
    req.alias = `boreholegeometry_formats`;
  });

  cy.intercept("/api/v2/boreholegeometry/getDepthInMasl?**").as("get-boreholegeometry-depth-masl");
  cy.intercept("/api/v2/boreholegeometry/getDepthMDFromMasl?**").as("get-boreholegeometry-depth-md");
  cy.intercept("/api/v2/boreholegeometry/getDepthTVD?**").as("get-depth-tvd");

  cy.intercept("/api/v2/boreholefile/getDataExtractionFileInfo*").as("extraction-file-info");
  cy.intercept({
    method: "GET",
    url: "/api/v2/boreholefile/dataextraction/*",
  }).as("load-extraction-file");

  cy.intercept("/api/v2/log?boreholeId=**").as("logrun_by_borehole_GET");

  cy.intercept("dataextraction/api/V1/extract_data").as("extract-data");
  cy.intercept("dataextraction/api/V1/extract_stratigraphy").as("extract-stratigraphy");

  cy.intercept("https://api3.geo.admin.ch/rest/services/height*").as("height");
  cy.intercept("https://geodesy.geo.admin.ch/reframe/lv95tolv03*").as("geodesy");
  cy.intercept("/api/v2/import/*").as("borehole-upload");
  cy.intercept("/api/v2/boreholefile/getAllForBorehole?boreholeId=**").as("getAllAttachments");
  cy.intercept("/api/v2/boreholefile/upload?boreholeId=**").as("upload-files");
  cy.intercept("/api/v2/boreholefile/download?boreholeFileId=**").as("download-file");
  cy.intercept("/api/v2/boreholefile/detachFile?boreholeFileId=**").as("delete-file");
  cy.intercept("/api/v2/photo/getAllForBorehole?boreholeId=**").as("getAllPhotos");
  cy.intercept("/api/v2/photo/upload?boreholeId=**").as("upload-photo");
  cy.intercept("/api/v2/photo/export?photoIds=**").as("export-photos");
  cy.intercept("DELETE", "/api/v2/photo?photoIds=**").as("delete-photos");
  cy.intercept("GET", "/api/v2/document/getAllForBorehole?boreholeId=**").as("getAllDocuments");
  cy.intercept("/api/v2/document*", req => {
    req.alias = `document_${req.method}`;
  });

  cy.intercept("POST", "/api/v2/maintenance/LocationMigration").as("start-location-migration");
  cy.intercept("POST", "/api/v2/maintenance/CoordinateMigration").as("start-coordinate-migration");
  cy.intercept("POST", "/api/v2/maintenance/UserMerge").as("start-user-merge");
  cy.intercept("GET", "/api/v2/maintenance/status").as("get-maintenance-status");
};

/**
 * Login into the application with the user for the development environment.
 */
export const login = (user: string) => {
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
        .then(interception => interception.response!.body.id_token)
        .then(token => globalThis.localStorage.setItem("id_token", token));
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
            auth: bearerAuth(token as string),
          }),
        );
      },
      cacheAcrossSpecs: true,
    },
  );
};

export const goToDetailRouteAndAcceptTerms = (route: string) => {
  cy.visit(route);
  cy.dataCy("accept-button").click();
  cy.wait(["@borehole_by_id", "@get-current-user"]);
};

export const goToRouteAndAcceptTerms = (route: string) => {
  cy.visit(route);
  cy.dataCy("accept-button").click();
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
  const adminUser2Workgroups = { ...adminUser };
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
  cy.dataCy("new-borehole-button").click();
  cy.contains("button", "Create").click();
  const id = waitForCreation();
  cy.wait(["@borehole_by_id"]);
  return id;
};

const defaultHrsId = 20106001;

const waitForCreation = () => {
  return cy.wait("@post-borehole").then(interception => {
    cy.task("log", "Created new borehole with id:" + interception.response!.body.id);
    cy.wrap(interception.response!.body.hrsId).should("eq", defaultHrsId);
    return cy.wrap(interception.response!.body.id);
  });
};

export const createBorehole = (borehole: Record<string, unknown>) => {
  return cy.get("@id_token").then(token => {
    return cy
      .request({
        method: "POST",
        url: "/api/v2/borehole",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: {
          workgroupId: 1,
          hrsId: defaultHrsId,
          ...borehole,
        },
        auth: bearerAuth(token as string),
      })
      .then(res => {
        return cy.wrap(res.body.id as number);
      });
  });
};

export const createBoreholeWithCompleteDataset = () => {
  return createBorehole({
    originalName: "Complete Test Borehole",
    restrictionId: restrictionFreeCode,
    boreholeGeometry: [
      {
        md: 0,
        x: 0,
        y: 0,
        z: 0,
        hazi: 0,
        devi: 0,
      },
    ],
    sections: [{ name: "Test Section", fromDepth: 0, toDepth: 10, SectionElements: [] }],
    stratigraphies: [
      {
        id: 0,
        boreholeId: 0,
        isPrimary: true,
        lithologies: [
          {
            id: 0,
            stratigraphyId: 0,
            fromDepth: 0,
            toDepth: 10,
            isUnconsolidated: true,
          },
        ],
        lithostratigraphyLayers: [
          {
            fromDepth: 0,
            toDepth: 10,
          },
        ],
        chronostratigraphyLayers: [
          {
            fromDepth: 0,
            toDepth: 10,
          },
        ],
      },
    ],
    completions: [
      {
        name: "Test Completion",
        kindId: 16000001,
        casings: [{ name: "Test Casing", fromDepth: 0, toDepth: 10, casingElements: [] }],
        backfills: [{ notes: "backfill notes" }],
        instrumentations: [{ fromDepth: 0, toDepth: 10 }],
      },
    ],
    observations: [
      { type: ObservationType.waterIngress },
      { type: ObservationType.groundwaterLevelMeasurement },
      { type: ObservationType.hydrotest },
      { type: ObservationType.fieldMeasurement },
    ],
    boreholeFiles: [{ name: "Test Profile File", file: { name: "testfile", url: "testurl", type: "text/csv" } }],
    photos: [{ name: "Test Photo", nameUuid: "uuid1234", fileType: "image/tiff" }],
    documents: [{ name: "Test Document", url: "testurl" }],
    logRuns: [
      {
        id: 0,
        boreholeId: 0,
        runNumber: "Run 111",
        fromDepth: 0,
        toDepth: 10,
        comment: "Test Log Run",
        serviceCo: "Test Service Co",
        runDate: null,
        bitSize: 34.235,
        conveyanceMethodId: null,
        boreholeStatusId: null,
        logFiles: [{ name: "logfile", nameUuid: "uuid1234" }],
      },
    ],
  });
};

export const startBoreholeEditing = () => {
  startEditing("detail-header");
  cy.wait(["@update-borehole", "@borehole_by_id"]);
};

export const stopBoreholeEditing = (discardChanges?: boolean) => {
  stopEditing();

  if (discardChanges) {
    cy.dataCy("prompt").find(`[data-cy="discardchanges-button"]`).click();
  }
  cy.wait(["@update-borehole", "@borehole_by_id"]);
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(100); // Small buffer for scroll operations
};

export const returnToOverview = () => {
  cy.dataCy("backButton").click();
  cy.wait(["@edit_list", "@borehole"]);
};

export const checkElementColorByDataCy = (attribute: string, expectedColor: string) => {
  cy.dataCy(attribute).should("have.css", "color", expectedColor);
};

export const deleteBorehole = (id: number | string) => {
  cy.get("@id_token").then(token => {
    cy.request({
      method: "POST",
      url: "/api/v1/borehole/edit",
      body: {
        action: "DELETE",
        id: id,
      },
      auth: bearerAuth(token as string),
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
      auth: bearerAuth(token as string),
    }).then(response => {
      response.body.data
        .filter((id: number) => id > 1002999) // max id in seed data.
        .forEach((id: number) => {
          deleteBorehole(id);
        });
    });

    // TODO: https://github.com/swisstopo/swissgeol-boreholes-suite/issues/2371
    //  Check if we still need this when we add new tests
    // // Reset stratigraphies
    // cy.request({
    //   method: "GET",
    //   url: "/api/v2/stratigraphy/getall",
    //   auth: bearerAuth(token),
    // }).then(response => {
    //   response.body
    //     .filter(st => st.id > 6002999) // max id in seed data.
    //     .forEach(st => {
    //       deleteStratigraphy(st.id);
    //     });
    // });

    // Reset user settings (i.e. table ordering)
    cy.request({
      method: "POST",
      url: "/api/v2/user/resetAllSettings",
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token as string),
      headers: {
        "Content-Type": "application/json",
      },
    });
  });
};

export const delayedType = (element: Cypress.Chainable<JQuery<HTMLElement>>, text: string) => {
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(500);
  element.type(text, { delay: 10 });
};

/**
 * Sets the value for a provided input element.
 *
 * cy.Type() can be slow. If every keystroke triggers a request it can be even slower.
 * Thus use setValueOfInputElement to set the value of the input element and only type one char after.
 * @param {object} inputElement The input element.
 * @param {string} inputValue The input string to set as value.
 */
export const setValueOfInputElement = function (inputElement: JQuery<HTMLElement>, inputValue: string) {
  inputElement[0].setAttribute("value", inputValue);
};

// Deletes a downloaded file in Cypress' downloads folder
export const deleteDownloadedFile = (fileName: string) => {
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

export const prepareDownloadPath = (fileName: string) => {
  // Get the path to the downloaded file you want to read
  let filePath = "cypress/downloads/" + fileName;

  // Override the path in case of windows os
  if (Cypress.platform === "win32") {
    filePath = "cypress\\downloads\\" + fileName;
  }
  return filePath;
};

// Read the downloaded file in Cypress' downloads folder
export const readDownloadedFile = (fileName: string) => {
  const filePath = prepareDownloadPath(fileName);

  cy.readFile(filePath);
};

// Get the file to import from the fixtures folder
export const getImportFileFromFixtures = (fileName: string, encoding: string | null, dataSet?: string) => {
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

  return encoding ? cy.fixture(filePath, encoding as Cypress.Encodings) : cy.fixture(filePath);
};

export interface StratigraphyInput {
  boreholeId: number | string;
  name: string;
  isPrimary?: boolean;
  date?: string | null;
}

export const createStratigraphy = ({ boreholeId, name, isPrimary = true, date = null }: StratigraphyInput) => {
  return cy.get("@id_token").then(token => {
    return cy
      .request({
        method: "POST",
        url: "/api/v2/stratigraphy",
        body: {
          id: 0,
          boreholeId: boreholeId,
          name: name,
          isPrimary: isPrimary,
          date: date,
        },
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        auth: bearerAuth(token as string),
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

export interface CompletionInput {
  name: string;
  boreholeId: number | string;
  kindId: number;
  isPrimary: boolean;
}

export const createCompletion = ({ name, boreholeId, kindId, isPrimary }: CompletionInput) => {
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
        auth: bearerAuth(token as string),
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

export interface CasingInput {
  name: string;
  boreholeId: number | string;
  completionId: number | string;
  dateStart?: string | null;
  dateFinish?: string | null;
  casingElements: unknown[];
}

export const createCasing = ({
  name,
  boreholeId,
  completionId,
  dateStart = null,
  dateFinish = null,
  casingElements,
}: CasingInput) => {
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
        auth: bearerAuth(token as string),
      })
      .then(res => {
        return cy.wrap(res.body.id);
      });
  });
};

type NullableId = number | string | null;

export const createTestCasing = (boreholeId: number | string, completionId: number | string) =>
  createCasing({
    name: "casing-1",
    boreholeId,
    completionId,
    dateStart: "2021-01-01",
    dateFinish: "2021-01-02",
    casingElements: [{ fromDepth: 0, toDepth: 10, kindId: 25000103 }],
  });

export const openStratigraphyEditorTab = (stratigraphyName: string, hash: string, waitAlias: string) => {
  createBorehole({ originalName: "INTEADAL" }).as("borehole_id");
  cy.get("@borehole_id").then(boreholeId => {
    createStratigraphy({ boreholeId: boreholeId as number, name: stratigraphyName }).as("stratigraphy_id");
    cy.get("@stratigraphy_id").then(stratigraphyId => {
      goToDetailRouteAndAcceptTerms(`/${boreholeId}/stratigraphy/${stratigraphyId}#${hash}`);
    });
  });
  startBoreholeEditing();
  cy.wait(waitAlias);
};

export interface ObservationInput {
  boreholeId: number | string;
  startTime: string;
  reliabilityId: number;
  casingId?: NullableId;
  fromDepthM?: number | null;
  toDepthM?: number | null;
}

export interface FieldMeasurementInput extends ObservationInput {
  sampleTypeId: number;
  parameterId: number;
  value: number;
}

export const createFieldMeasurement = ({
  boreholeId,
  startTime,
  reliabilityId,
  sampleTypeId,
  parameterId,
  value,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
}: FieldMeasurementInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export interface WaterIngressInput extends ObservationInput {
  quantityId: number;
}

export const createWateringress = ({
  boreholeId,
  startTime,
  reliabilityId,
  quantityId,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
}: WaterIngressInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export interface GroundwaterLevelMeasurementInput extends ObservationInput {
  kindId: number;
}

export const createGroundwaterLevelMeasurement = ({
  boreholeId,
  startTime,
  reliabilityId,
  kindId,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
}: GroundwaterLevelMeasurementInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export interface HydrotestInput extends ObservationInput {
  kindCodelistIds: number[];
}

export const createHydrotest = ({
  boreholeId,
  startTime,
  reliabilityId,
  kindCodelistIds,
  casingId = null,
  fromDepthM = null,
  toDepthM = null,
}: HydrotestInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export interface BackfillInput {
  completionId: number | string;
  casingId?: number | string | null;
  materialId?: number | null;
  kindId?: number | null;
  fromDepth: number;
  toDepth: number;
  notes?: string | null;
}

export const createBackfill = ({
  completionId,
  casingId = null,
  materialId = null,
  kindId = null,
  fromDepth,
  toDepth,
  notes = null,
}: BackfillInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export interface InstrumentInput {
  completionId: number | string;
  casingId?: number | string | null;
  name: string;
  statusId?: number | null;
  kindId?: number | null;
  fromDepth: number;
  toDepth: number;
  notes?: string | null;
}

export const createInstrument = ({
  completionId,
  casingId = null,
  name,
  statusId = null,
  kindId = null,
  fromDepth,
  toDepth,
  notes = null,
}: InstrumentInput) => {
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
      auth: bearerAuth(token as string),
    });
  });
};

export const handlePrompt = (message: string | null, action: string) => {
  cy.dataCy("prompt").should("be.visible");
  if (message && message.length > 0) {
    cy.contains(message);
  }
  cy.dataCy("prompt").find(`[data-cy="${action.toLowerCase()}-button"]`).click();
};

export const createBaseSelector = (parent?: string) => {
  if (parent) {
    return `[data-cy="${parent}"] `;
  } else {
    return "";
  }
};

export const selectLanguage = (language: string) => {
  cy.dataCy("language-button-select").click({ force: true });
  cy.dataCy(`${language.toLowerCase()}-button-select-item`).click({ force: true });
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
};

export const selectInputFile = (fileName: string, mimeType: string) => {
  const crypto = globalThis.crypto || (globalThis as unknown as Record<string, Crypto | undefined>).msCrypto;
  const content = crypto.getRandomValues(new Uint32Array(1)).toString();

  cy.get("input[type=file]").selectFile(
    {
      contents: Cypress.Buffer.from(content),
      fileName: fileName,
      mimeType: mimeType,
    },
    { force: true },
  );
  // eslint-disable-next-line cypress/no-unnecessary-waiting
  cy.wait(1000);
};

export const dropGeometryCSVFile = () => {
  const geometryFile = new DataTransfer();
  getImportFileFromFixtures("geometry_azimuth_inclination.csv", null).then(fileContent => {
    const file = new File([fileContent], "geometry_azimuth_inclination.csv", {
      type: "text/csv",
    });
    geometryFile.items.add(file);
  });
  cy.dataCy("import-geometry-input").within(() => {
    cy.get("input[type=file]").then(input => {
      (input[0] as HTMLInputElement).files = geometryFile.files;
      input[0].dispatchEvent(new Event("change", { bubbles: true }));
    });
  });
};
