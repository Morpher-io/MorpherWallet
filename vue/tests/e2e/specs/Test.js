

// https://docs.cypress.io/api/introduction/api.html

describe('Test', () => {

    it('Open The register URL', () => {
        cy.createInbox().then((inbox) => {
            console.log(inbox);

            const email = inbox.emailAddress
            // { id: '...', emailAddress: '...' }
        });
    });
});