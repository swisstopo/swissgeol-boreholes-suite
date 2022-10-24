const adminUserAuth = {
  user: "admin",
  password: "swissforages",
};

export const interceptApiCalls = () => {
  cy.intercept("/api/v1/geoapi/canton").as("geoapi");
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
};

export const newEditableBorehole = () => {
  const id = newUneditableBorehole();
  cy.contains("a", "Start editing").click();
  cy.wait("@edit_lock");
  return id;
};

export const newUneditableBorehole = () => {
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
