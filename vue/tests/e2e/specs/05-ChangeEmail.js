// https://docs.cypress.io/api/introduction/api.html

describe('Change Email', () => {
	const email = Cypress.env('firstEmail');
	const secondEmail = Cypress.env('secondEmail');

	const password = 'Test123!';

	it('change email error', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.url().should('contain', '/'));

		cy.get('h1').contains('Morpher Wallet');
		cy.get('h2').contains('Hello');

		cy.get('[data-cy=settings]').click();

		cy.get('[data-cy=openEmailChange]').click();

		cy.get('[data-cy=newEmail]').type(secondEmail);

		cy.get('[data-cy=password]').type('12345');

		cy.get('[data-cy=updateEmail]').click();

		cy.get('[data-cy=invalidMessage]').contains('The password you entered is not correct!');
	});

	it('change email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

		cy.get('h1').contains('Morpher Wallet');
		cy.get('h2').contains('Hello');

		cy.get('[data-cy=settings]').click();

		cy.get('[data-cy=openEmailChange]').click();

		cy.get('[data-cy=newEmail]').type(secondEmail);

		cy.get('[data-cy=password]').type(password);

		cy.get('[data-cy=updateEmail]').click();

		cy.request('POST', 'http://localhost:8080/v1/test/getEmailCode', { email }).then(response => {
			// response.body is automatically serialized into JSON
			const code = response.body.email_verification_code;

			cy.get('[data-cy=twoFa]').type(code);

			cy.get('[data-cy=updateEmail]').click();

			cy.get('[data-cy=isSuccess]').contains('Saved');
		});
	});

	it('login new email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(secondEmail)
			.should('have.value', secondEmail);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

		cy.get('h1').contains('Morpher Wallet');
		cy.get('h2').contains('Hello');
	});

	it('change email back to original', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(secondEmail)
			.should('have.value', secondEmail);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

		cy.get('h1').contains('Morpher Wallet');
		cy.get('h2').contains('Hello');

		cy.get('[data-cy=settings]').click();

		cy.get('[data-cy=openEmailChange]').click();

		cy.get('[data-cy=newEmail]').type(email);

		cy.get('[data-cy=password]').type(password);

		cy.get('[data-cy=updateEmail]').click();

		cy.request('POST', 'http://localhost:8080/v1/test/getEmailCode', { email: secondEmail }).then(response => {
			// response.body is automatically serialized into JSON
			const code = response.body.email_verification_code;

			cy.get('[data-cy=twoFa]').type(code);

			cy.get('[data-cy=updateEmail]').click();

			cy.get('[data-cy=isSuccess]').contains('Saved');
		});
	});
});
