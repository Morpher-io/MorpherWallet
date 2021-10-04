// https://docs.cypress.io/api/introduction/api.html

describe('Authenticator 2FA', () => {
	const email = Cypress.env('firstEmail');
	const password = Cypress.env('firstPassword');
	const backendUrl = Cypress.env('backendUrl');

	it('Error on Bad Authenticator Code', () => {
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
		cy.get('[data-cy=verificationSettings]').click();

		cy.get('[data-cy=authenticatorToggle]').contains('Enable');

		cy.get('[data-cy=authenticatorToggle]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('Please enter your password before making changes.');

		cy.get('[data-cy=confirmAccessPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=confirmAccessButton]').click();

		cy.get('[data-cy=2faAuthenticatorCode]')
			.type('123456')
			.should('have.value', '123456');

		cy.get('[data-cy=confirm2faButton]').click();

		cy.get('[data-cy=2faAuthenticatorError]').contains('Could not verify authenticator code.');
	});

	it('Successfully Enable Authenticator 2FA', { retries: 5 }, () => {
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
		cy.get('[data-cy=verificationSettings]').click();

		cy.get('[data-cy=authenticatorToggle]').contains('Enable');

		cy.get('[data-cy=authenticatorToggle]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('Please enter your password before making changes.');

		cy.get('[data-cy=confirmAccessPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=confirmAccessButton]').click();

		cy.request('POST', `${backendUrl}/v1/test/getUserSecret`, { email }).then(response => {
			const secret = response.body.authenticator_secret;

			cy.task('generateOTP', secret).then(token => {
				cy.get('[data-cy=2faAuthenticatorCode]').type(token);

				cy.get('[data-cy=confirm2faButton]').click();

				cy.waitUntil(() => cy.get('[data-cy=2faConfirmedTitle]').contains('2-Step Activated'));
				cy.get('[data-cy=2faConfirmedDescription]').contains(
					'All done, 2-step verification has been added to your account. Your account is now more secure!'
				);

				cy.get('[data-cy=closeButton]').click();

				cy.get('[data-cy=authenticatorToggle]').contains('Disable');

				cy.get('[data-cy=authenticator2faConfirmed]').contains('Verification enabled');
			});
		});
	});

	it('Login After Authenticator Enable', { retries: 5 }, () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=verificationTitle]').contains('2-Step Verification'));

		cy.request('POST', `${backendUrl}/v1/test/getUserSecret`, { email }).then(response => {
			const secret = response.body.authenticator_secret;

			cy.task('generateOTP', secret).then(token => {
				cy.get('[data-cy=authenticatorCode]').type(token);

				cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

				cy.get('[data-cy=sendButton]').contains('Send');
				cy.get('[data-cy=settingsButton]').contains('Settings');

				cy.get('[data-cy=2FAAuthenticatorEnabled]').contains('Enabled');
			});
		});
	});

	it('Disable 2FA Authenticator', { retries: 5 }, () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email);

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=verificationTitle]').contains('2-Step Verification'));

		cy.request('POST', `${backendUrl}/v1/test/getUserSecret`, { email }).then(response => {
			const secret = response.body.authenticator_secret;

			cy.task('generateOTP', secret).then(token => {
				cy.get('[data-cy=authenticatorCode]').type(token);

				cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

				cy.get('[data-cy=sendButton]').contains('Send');
				cy.get('[data-cy=settingsButton]').contains('Settings');

				cy.get('[data-cy=2FAAuthenticatorEnabled]').contains('Enabled');

				cy.get('[data-cy=settingsButton]').click();
				cy.get('[data-cy=verificationSettings]').click();

				cy.get('[data-cy=authenticatorToggle]').contains('Disable');

				cy.get('[data-cy=authenticatorToggle]').click();

				cy.get('[data-cy=confirmAccessTitle]').contains('Please enter your password before making changes.');

				cy.get('[data-cy=confirmAccessPassword]')
					.type(password)
					.should('have.value', password);

				cy.get('[data-cy=confirmAccessButton]').click();

				cy.waitUntil(() => cy.get('[data-cy=2faConfirmedTitle]').contains('2-Step Deactivated'));
				cy.get('[data-cy=2faDisabledDescription]').contains('2-step verification has been removed from your account.');

				cy.get('[data-cy=closeButton]').click();
			});
		});
	});
});
