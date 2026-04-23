import "cypress-real-events";

declare global {
  namespace Cypress {
    // Allow cache/credentials fetch-style options passed through to cy.request
    interface RequestOptions {
      cache?: string;
      credentials?: string;
    }

    interface Chainable {
      /**
       * Custom command to select DOM elements by data-cy attribute.
       * @example cy.dataCy('greeting')
       */
      dataCy(key: string, options?: Partial<TypeOptions>): Chainable<JQuery<HTMLElement>>;
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
