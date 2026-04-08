declare global {
  namespace Cypress {
    interface Chainable {
      get(alias: "@borehole_id"): Chainable<number>;
      get(alias: "@stratigraphy_id"): Chainable<number>;
      get(alias: "@completion_id"): Chainable<number>;
      get(alias: "@casing1_id"): Chainable<number>;
      get(alias: "@casing2_id"): Chainable<number>;
      get(alias: "@id_token"): Chainable<string>;
    }
  }
}

export {};
