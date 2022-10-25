// https://docs.cypress.io/api/introduction/api.html

describe('Email 2FA', () => {
	const email = Cypress.env('firstEmail');
	const secondEmail = Cypress.env('secondEmail');
	const password = Cypress.env('firstPassword');
	const backendUrl = Cypress.env('backendUrl');

	it('Activate Email 2FA', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=verificationSettings]').click();

		cy.get('[data-cy=emailToggle]').contains('Enable');

		cy.get('[data-cy=emailToggle]').click();

		//cy.get('[data-cy=confirmAccessTitle]').contains('Please enter your password before making changes.');

		//cy.get('[data-cy=confirmAccessPassword]').type(password).should('have.value', password);

		//cy.get('[data-cy=confirmAccessButton]').click();

		cy.waitUntil(() => cy.get('[data-cy=emailConfirmationTitle]').contains('Email Confirmation'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=2faEmailCode]').type(code);

			cy.get('[data-cy=confirmButton]').click();

			cy.waitUntil(() => cy.get('[data-cy=2faConfirmedTitle]').contains('2-Step Activated'));
			cy.get('[data-cy=2faConfirmedDescription]').contains(
				'All done, 2-step verification has been added to your account. Your account is now more secure!'
			);

			cy.get('[data-cy=closeButton]').click();

			cy.get('[data-cy=emailToggle]').contains('Disable');

			cy.get('[data-cy=email2faConfirmed]').contains('Verification enabled');
		});
	});

	it('Login with Email 2FA Activated', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=verificationTitle]').contains('2-Step Verification'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=emailCode]').type(code);

			cy.get('[data-cy=unlock]').click();

			cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

			cy.get('[data-cy=sendButton]').contains('Send');
			cy.get('[data-cy=settingsButton]').contains('Settings');

			cy.get('[data-cy=2FAEmailEnabled]').contains('Enabled');
		});
	});

	it('Disable Email 2FA', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=verificationTitle]').contains('2-Step Verification'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=emailCode]').type(code);

			cy.get('[data-cy=unlock]').click();

			cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

			cy.get('[data-cy=sendButton]').contains('Send');
			cy.get('[data-cy=settingsButton]').contains('Settings');

			cy.get('[data-cy=settingsButton]').click();
			cy.get('[data-cy=verificationSettings]').click();

			cy.get('[data-cy=emailToggle]').contains('Disable');

			cy.get('[data-cy=emailToggle]').click();

			

			cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

			cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
				const code = response.body.email_verification_code;
				cy.get('[data-cy=2faEmailCode]').type(code);
				cy.get('[data-cy=confirmAccessButton]').click();

				cy.waitUntil(() => cy.get('[data-cy=2faConfirmedTitle]').contains('2-Step Deactivated'));
				cy.get('[data-cy=2faDisabledDescription]').contains('2-step verification has been removed from your account.');
	
				cy.get('[data-cy=closeButton]').click();
			});



		});
	});

	it('Change Login Email Error', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=emailChangeButton]').click();

		cy.get('[data-cy=newEmail]').type(secondEmail).should('have.value', secondEmail);

		cy.get('[data-cy=confirmPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=updateEmailButton]').click();

		cy.waitUntil(() => cy.get('[data-cy=emailConfirmationTitle]').contains('Email Confirmation'));

		cy.get('[data-cy=2faEmailCode]').type('111111');

		cy.get('[data-cy=confirmButton]').click();

		cy.waitUntil(() => cy.get('[data-cy=2faEmailError]').contains('Could not verify email code. Please try again.'));
	});

	it('Change Login Email', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(email));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=emailChangeButton]').click();

		cy.get('[data-cy=newEmail]').type(secondEmail).should('have.value', secondEmail);

		cy.get('[data-cy=confirmPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=updateEmailButton]').click();

		cy.waitUntil(() => cy.get('[data-cy=emailConfirmationTitle]').contains('Email Confirmation'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=2faEmailCode]').type(code);

			cy.get('[data-cy=confirmButton]').click();

			cy.get('[data-cy=emailUpdatedTitle]').contains('Email Updated');

			cy.get('[data-cy=emailUpdatedDescription]').contains('Your email was successfully updated!');
		});
	});

	it('Login new Email', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(secondEmail).should('have.value', secondEmail);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(secondEmail));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');
	});

	it('Change Login Email Back to Original', () => {
		cy.visit('/');

		cy.get('[data-cy=emailLoginButton]').click();
		

		cy.waitUntil(() => cy.get('[data-cy=walletEmail]'));


		cy.get('[data-cy=walletEmail]').type(secondEmail).should('have.value', secondEmail);

		cy.get('[data-cy=walletPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=submit]').click();

		cy.waitUntil(() => cy.get('[data-cy=currentEmail]').contains(secondEmail));

		cy.get('[data-cy=sendButton]').contains('Send');
		cy.get('[data-cy=settingsButton]').contains('Settings');

		cy.get('[data-cy=settingsButton]').click();
		cy.get('[data-cy=emailPasswordButton]').click();
		cy.get('[data-cy=emailChangeButton]').click();

		cy.get('[data-cy=newEmail]').type(email).should('have.value', email);

		cy.get('[data-cy=confirmPassword]').type(password).should('have.value', password);

		cy.get('[data-cy=updateEmailButton]').click();

		cy.waitUntil(() => cy.get('[data-cy=emailConfirmationTitle]').contains('Email Confirmation'));

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email: secondEmail }).then((response) => {
			const code = response.body.email_verification_code;

			cy.get('[data-cy=2faEmailCode]').type(code);

			cy.get('[data-cy=confirmButton]').click();

			cy.get('[data-cy=emailUpdatedTitle]').contains('Email Updated');

			cy.get('[data-cy=emailUpdatedDescription]').contains('Your email was successfully updated!');
		});
	});
});
