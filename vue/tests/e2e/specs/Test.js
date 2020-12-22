

// https://docs.cypress.io/api/introduction/api.html

describe('Test', () => {

    it('Open The register URL', () => {
        // cy.createInbox().then((inbox) => {
        //     console.log(inbox);
        //
        //     const email = inbox.emailAddress
        //     // { id: '...', emailAddress: '...' }
        // });

        cy.request('POST', 'http://localhost:8080/v1/test/getUserSecret', { email: 'test' })
            .then((response) => {
                // response.body is automatically serialized into JSON
                console.log(response.body)
            })
    });

});