// https://docs.cypress.io/api/introduction/api.html

describe('Signup', () => {
	let email;
	let inbox;

	const password = 'Test123!';
	const newPassword = 'Test12345!';


	it('Register', () => {

		cy.createInbox().then((mail) => {
			inbox = mail;
			email = mail.emailAddress;

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

			cy.waitForLatestEmail(inbox.id).then((email) => {
				const code = email.body.substr(email.body.length - 8)

				cy.get('[data-cy=emailCode]')
					.type(code)

				cy.get('[data-cy=unlock]')

				cy.get('h1').contains('Morpher Wallet')
				cy.get('h2').contains('Hello')
			});
		})
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

		cy.waitForLatestEmail(inbox.id).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')
		});
	});

	it('change password', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitForLatestEmail(inbox.id).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.wait(2000)

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')

			cy.get('[data-cy=settings]').click()

			cy.get('[data-cy=openPasswordChange]').click()

			cy.get('[data-cy=oldPassword]')
				.type(password)

			cy.get('[data-cy=newPassword]')
				.type(newPassword)

			cy.get('[data-cy=newPasswordRepeat]')
				.type(newPassword)

			cy.get('[data-cy=passwordSubmit]').click()

			cy.wait(2000)

			cy.get('[data-cy=confirmed]')
				.contains('Saved')
		});
	});
});