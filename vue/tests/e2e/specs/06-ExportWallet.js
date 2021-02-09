// https://docs.cypress.io/api/introduction/api.html

describe('Export Wallet', () => {
	const email = Cypress.env('firstEmail');

	const password = 'Test123!';

	it('show seed', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=showSeed]').click();

		cy.get('[data-cy=seedTitle]').contains('Seed Phrase');
	});

	it('export seed', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=exportSeed]').click();

		cy.wait(1000);

		cy.get('[data-cy=spinner-status]').contains('Seed Phrase exported successfully');
	});

	it('show private key', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=showPrivateKey]').click();

		cy.get('[data-cy=privateKeyTitle]').contains('Private Key');
	});

	it('export keystore', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=exportPrivateKey]').click();

		cy.wait(1000);

		cy.get('[data-cy=spinner-status]').contains('Keystore exported successfully');
	});

	it('fails to delete wallet if wrong password', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=exportSeed]').click();

		cy.wait(2000);

		cy.get('[data-cy=deleteAccount]').click();

		cy.get('[data-cy=spinner-status]').contains('Wrong password for account deletion');
	});

	it('deletes wallet successfully', () => {
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

		cy.get('[data-cy=exportHeader]').click();

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=exportSeed]').click();

		cy.wait(2000);

		cy.get('[data-cy=seedPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=deleteAccount]').click();

		cy.get('[data-cy=spinner-status]').contains('Wallet deleted successfully');
	});
});
