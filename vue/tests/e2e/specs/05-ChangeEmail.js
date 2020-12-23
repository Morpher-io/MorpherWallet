// https://docs.cypress.io/api/introduction/api.html

describe('Change Email', () => {
	const email = '6b93f9b1-ba8e-42ee-b2ee-0b566a9b0ce8@mailslurp.com';
	const inbox = '6b93f9b1-ba8e-42ee-b2ee-0b566a9b0ce8';

	const secondEmail = 'a8a78e8b-5f4a-41e4-b99b-57b945f973a0@mailslurp.com';
	const secondInbox = 'a8a78e8b-5f4a-41e4-b99b-57b945f973a0';

	const password = 'Test123!';

	it('change email error', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.url().should('contain', '/'));

		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

		cy.get('[data-cy=settings]').click()

		cy.get('[data-cy=openEmailChange]').click()

		cy.get('[data-cy=newEmail]')
			.type(secondEmail)

		cy.get('[data-cy=password]')
			.type('12345')

		cy.get('[data-cy=updateEmail]').click()

		cy.get('[data-cy=invalidMessage]').contains('The password you entered is not correct!')

	});

	it('change email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

		cy.get('[data-cy=settings]').click()

		cy.get('[data-cy=openEmailChange]').click()

		cy.get('[data-cy=newEmail]')
			.type(secondEmail)

		cy.get('[data-cy=password]')
			.type(password)

		cy.get('[data-cy=updateEmail]').click()

		cy.wait(3000)

		cy.waitForLatestEmail(secondInbox).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=twoFa]')
				.type(code)

			cy.get('[data-cy=updateEmail]').click()

			cy.get('[data-cy=isSuccess]')
				.contains('Saved')

		})

	});

	it('login new email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(secondEmail)
			.should('have.value', secondEmail)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

	});

	it('change email back to original', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(secondEmail)
			.should('have.value', secondEmail)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));


		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

		cy.get('[data-cy=settings]').click()

		cy.get('[data-cy=openEmailChange]').click()

		cy.get('[data-cy=newEmail]')
			.type(email)

		cy.get('[data-cy=password]')
			.type(password)

		cy.get('[data-cy=updateEmail]').click()

		cy.wait(3000)

		cy.waitForLatestEmail(inbox).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=twoFa]')
				.type(code)

			cy.get('[data-cy=updateEmail]').click()

			cy.get('[data-cy=isSuccess]')
				.contains('Saved')

		})

	});

});