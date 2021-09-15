// https://docs.cypress.io/api/introduction/api.html

describe('Passwords', () => {
	const email = Cypress.env('firstEmail');
	const password = Cypress.env('firstPassword');
	const newPassword = Cypress.env('secondPassword');
	const incorrectPassword = Cypress.env('incorrectPassword');

	it('Error on Login Incorrect Password', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type('123456')
			.should('have.value', '123456');

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=loginError]').contains('Password provided failed to decrypt your account.'));
	});

	it('Error on Change Password Incorrect Password', () => {
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

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=passwordChangeButton]').click();

		cy.get('[data-cy=oldPassword]')
			.type(incorrectPassword)
			.should('have.value', incorrectPassword);

		cy.get('[data-cy=newPassword]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=newPasswordRepeat]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=passwordSubmit]').click();

		cy.waitUntil(() => cy.get('[data-cy=incorrectPassword]').contains('Something went wrong. Please try again later.'));
	});

	it('Successfully Change Password', () => {
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

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=passwordChangeButton]').click();

		cy.get('[data-cy=oldPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=newPassword]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=newPasswordRepeat]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=passwordSubmit]').click();

		cy.waitUntil(() => cy.get('[data-cy=passwordChangeTitle]').contains('Password Updated'));

		cy.get('[data-cy=passwordChangeDescription]').contains('Your password was successfully updated!');
	});

	it('Login with New Password', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));
		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');
	});

	it('Successfully Change Password Back to Original', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));
		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=passwordChangeButton]').click();

		cy.get('[data-cy=oldPassword]')
			.type(newPassword)
			.should('have.value', newPassword);

		cy.get('[data-cy=newPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=newPasswordRepeat]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=passwordSubmit]').click();

		cy.waitUntil(() => cy.get('[data-cy=passwordChangeTitle]').contains('Password Updated'));

		cy.get('[data-cy=passwordChangeDescription]').contains('Your password was successfully updated!');
	});
});
