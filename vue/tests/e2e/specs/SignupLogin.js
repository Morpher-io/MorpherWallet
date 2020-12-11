// https://docs.cypress.io/api/introduction/api.html

describe('Register', () => {
	it('Open The root URL', () => {
		cy.visit('/');
		// check that the logon page is displayed
		cy.contains('h2', 'Wallet Login');
	});

	it('Open The register URL', () => {
		cy.visit('/signup');
		cy.contains('h2', 'Signup');
		cy.contains('h4', 'Create a new Wallet');
	});

	it('Register', () => {
		
		cy.get('#walletEmail')
		.type('test4@beornb.com')
		.should('have.value', 'test4@beornb.com')


		cy.get('#walletPassword')
		.type('Password123###')
		.should('have.value', 'Password123###')

		cy.get('#walletPasswordRepeat')
		.type('Password123###')
		.should('have.value', 'Password123###')		

		cy.contains('Create new Wallet').click()

		cy.wait(8000);


	});

	it('Enter 2fa', () => {
		cy.url().should('include', '/2fa')

		const code = window.prompt('Email 2fa code')

		cy.get('#emailCode')
		.type(code)
		.should('have.value', code)		

		cy.contains('Unlock').click()

		cy.wait(8000);
	});
});
describe('Logout and Login', () => {
	it('check logon page', () => {
		cy.visit('/');
		// check that the logon page is displayed
		cy.contains('h2', 'Welcome');
	});
});

