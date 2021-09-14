// https://docs.cypress.io/api/introduction/api.html

describe('Front Page', () => {
	it('Open The root URL', () => {
		cy.visit('/');
		// check that the logon page is displayed
		cy.contains('h2', 'Wallet Login');
		//console.log(Cypress.env('firstEmail'));
	});

	it('Open The register URL', () => {
		cy.visit('/signup');
		cy.contains('h2', 'Signup');
		cy.contains('h4', 'Create a new wallet.');
	});
});
