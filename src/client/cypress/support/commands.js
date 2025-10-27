/**
 * Custom command to get elements by data-cy attribute.
 * @param {JQuery<HTMLElement>=} subject - Optional subject to search within.
 * @param {string} key - The data-cy value to search for.
 * @returns {Cypress.Chainable<JQuery<HTMLElement>>}
 */
Cypress.Commands.add("dataCy", {prevSubject: "optional"}, (subject, key) => {
    if (subject) {
        return cy.wrap(subject).find(`[data-cy="${key}"]`);
    }
    return cy.get(`[data-cy="${key}"]`);
});
