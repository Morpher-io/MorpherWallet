// https://docs.cypress.io/api/introduction/api.html

describe('Signup', () => {
	const email = 'eb4efc22-f589-4655-86dd-7514982c946a@mailslurp.com';
	const inbox = 'eb4efc22-f589-4655-86dd-7514982c946a';

	const password = 'Test123!';


	it('Signup and Login', () => {
		cy.visit('/signup');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)


		cy.get('[data-cy=walletPasswordRepeat]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=createNewWallet]').click()

		cy.wait(3000)

		cy.waitForLatestEmail(inbox).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')
		});
	});

	it('Login user', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.wait(3000)

		cy.waitForLatestEmail(inbox).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')
		});
	});

	it('disable twofa email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.wait(3000)

		cy.waitForLatestEmail(inbox).then((email) => {
			const code = email.body.substr(email.body.length - 8);

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')

			cy.get('[data-cy=settings]').click()

			cy.get('[data-cy=openTwoFaChange]').click()

			cy.get('[data-cy=twoFaEmail]').click()

			cy.get('[data-cy=saveTwoFa]').click()

			cy.wait(2000)

			cy.get('[data-cy=isSuccess]').contains('Saved')
		});
	});

	it('test logout', () => {
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

		cy.get('[data-cy=logout]').click()

		cy.contains('h2', 'Wallet Login');
	});
});