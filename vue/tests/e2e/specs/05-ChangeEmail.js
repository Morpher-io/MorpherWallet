// https://docs.cypress.io/api/introduction/api.html

describe('Change Email', () => {
	const email = 'eb4efc22-f589-4655-86dd-7514982c946a@mailslurp.com';
	const inbox = 'eb4efc22-f589-4655-86dd-7514982c946a';

	const secondEmail = 'cceec05b-6f5d-4bcd-af98-7fac4f95ea9c@mailslurp.com';
	const secondInbox = 'cceec05b-6f5d-4bcd-af98-7fac4f95ea9c';

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

		cy.wait(2000)

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

		cy.wait(2000)


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

			cy.get('[data-cy=isSuccess]')
				.contains('Saved')

		})

	});

});