// https://docs.cypress.io/api/introduction/api.html

describe('Delete User', () => {
	const email = Cypress.env('firstEmail');
	const password = 'Test123!';

	const backendUrl = Cypress.env('backendUrl');

	it('Deletes the user for a fresh database', () => {
		console.log(backendUrl)
		cy.request('POST', `${backendUrl}/v1/test/deleteUser`, { email }).then(() => {
			cy.visit('/');

			cy.get('[data-cy=walletEmail]')
				.type(email)
				.should('have.value', email);

			cy.get('[data-cy=walletPassword]')
				.type(password)
				.should('have.value', password);

			cy.get('[data-cy=submit]').click();

			cy.get('[data-cy=loginError]').contains('User not found');
		});
	});
});
