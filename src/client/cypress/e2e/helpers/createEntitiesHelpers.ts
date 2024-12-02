import { bearerAuth } from "./testHelpers";

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
      },
      cache: "no-cache",
      credentials: "same-origin",
      auth: bearerAuth(token),
    });
  });
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
        const boreholeId = res.body.id;
        const fields = Object.entries(values).map(([key, value]) => [key, value]);
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
