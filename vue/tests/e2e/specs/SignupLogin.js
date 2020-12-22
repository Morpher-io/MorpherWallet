// https://docs.cypress.io/api/introduction/api.html

describe('Signup', () => {
	const email = '9c2a28b4-69e4-435c-b9fc-f770c7534e4f@mailslurp.com';
	const inbox = '9c2a28b4-69e4-435c-b9fc-f770c7534e4f';

	let secondEmail;
	let secondInbox;

	const password = 'Test123!';
	const newPassword = 'Test12345!';


	it('Register', () => {
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

		cy.waitForLatestEmail(inbox.id).then((email) => {
			const code = email.body.substr(email.body.length - 8)

			cy.get('[data-cy=emailCode]')
				.type(code)

			cy.get('[data-cy=unlock]')

			cy.get('h1').contains('Morpher Wallet')
			cy.get('h2').contains('Hello')
		});
	});

	it('change twofa email', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

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

			cy.get('[data-cy=isSuccess]').contains('Saved')
		});
	});

	it('error if change twofa authenticator bad code', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

		cy.get('[data-cy=settings]').click()

		cy.get('[data-cy=openTwoFaChange]').click()

		cy.get('[data-cy=twoFaAuthenticator]').click()

		cy.get('[data-cy=generateQR]').click()


		cy.get('[data-cy=authenticatorCode]').type('123456')

		cy.get('[data-cy=confirmAuthenticator]').click()

		cy.get('[data-cy=saveTwoFa]')

		// cy.get('[data-cy=isSuccess]').contains('Saved')



		// cy.get('[data-cy=isSuccess]').contains('Saved')
	});

	it('change twofa authenticator', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.get('h1').contains('Morpher Wallet')
		cy.get('h2').contains('Hello')

		cy.get('[data-cy=settings]').click()

		cy.get('[data-cy=openTwoFaChange]').click()

		cy.get('[data-cy=twoFaAuthenticator]').click()

		cy.get('[data-cy=generateQR]').click()

		cy.request('POST', 'http://localhost:8080/v1/test/getUserSecret', { email })
			.then((response) => {
				// response.body is automatically serialized into JSON
				const secret = response.body.authenticator_secret;

				cy.task("generateOTP", secret).then(token => {
					cy.get('[data-cy=authenticatorCode]').type(token)

					cy.get('[data-cy=confirmAuthenticator]').click()

					cy.get('[data-cy=saveTwoFa]')

					cy.get('[data-cy=isSuccess]').contains('Saved')
				});
			})

		// cy.get('[data-cy=isSuccess]').contains('Saved')
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

	it('change email', () => {
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

			cy.createInbox().then((mail) => {
				secondInbox = mail;
				secondEmail = mail.emailAddress;

				cy.get('[data-cy=settings]').click()

				cy.get('[data-cy=openEmailChange]').click()

				cy.get('[data-cy=newEmail]')
					.type(secondEmail)

				cy.get('[data-cy=password]')
					.type(password)

				cy.get('[data-cy=updateEmail]').click()

				cy.wait(2000)

				cy.waitForLatestEmail(secondInbox.id).then((email) => {
					const code = email.body.substr(email.body.length - 8)

					cy.get('[data-cy=twoFa]')
						.type(code)

					cy.get('[data-cy=isSuccess]')
						.contains('Saved')

				})
			})

		});
	});
});