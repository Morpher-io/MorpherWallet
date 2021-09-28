// https://docs.cypress.io/api/introduction/api.html

describe('Signup and Login', () => {
	const email = Cypress.env('firstEmail');
	const password = Cypress.env('firstPassword');
	const backendUrl = Cypress.env('backendUrl');

	it('Signup and Login', () => {
		cy.visit('/signup');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=walletPasswordRepeat]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=createNewWallet]').click();

		cy.waitUntil(() => cy.get('[data-cy=verificationTitle]').contains('2-Step Verification'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then(response => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=emailCode]').type(code);

			cy.get('[data-cy=unlock]').click();

			cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

			cy.get('[data-cy=sendButton]').contains('Send');
			cy.get('[data-cy=settingsButton]').contains('Settings');
		});
	});

	it('Login Existing User', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');
	});

	it('Logout Existing User', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));
		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=logoutButton]').click();

		cy.waitUntil(() => cy.contains('[data-cy=logInTitle]', 'Log In'));
		cy.contains('[data-cy=logInDescription]', 'Unlock your crypto wallet.');
	});
});
