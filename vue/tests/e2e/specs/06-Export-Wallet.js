// https://docs.cypress.io/api/introduction/api.html

describe('Export Wallet', () => {
	const email = Cypress.env('firstEmail');
	const password = Cypress.env('firstPassword');
	let privateKey;
	const backendUrl = Cypress.env('backendUrl');

	it('Export Private Key Error on Wrong Password', () => {
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
		cy.get('[data-cy=exportWalletButton]').click();
		cy.get('[data-cy=exportPrivateKeyButton]').click();


		cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;
			cy.get('[data-cy=2faEmailCode]').type('123456').should('have.value', '123456');;
			cy.get('[data-cy=confirmAccessButton]').click();


			cy.waitUntil(() => cy.get('[data-cy=passwordError]').contains('Could not verify email code. Please try again.'));
		});
	});

	it('Export Seed Phrase Error on Wrong Password', () => {
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
		cy.get('[data-cy=exportWalletButton]').click();
		cy.get('[data-cy=exportSeedPhraseButton]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;
			cy.get('[data-cy=2faEmailCode]').type('123456').should('have.value', '123456');;
			cy.get('[data-cy=confirmAccessButton]').click();


			cy.waitUntil(() => cy.get('[data-cy=passwordError]').contains('Could not verify email code. Please try again.'));
		});
	});

	it('Export Private Key', () => {
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
		cy.get('[data-cy=exportWalletButton]').click();
		cy.get('[data-cy=exportPrivateKeyButton]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;
			cy.get('[data-cy=2faEmailCode]').type(code).should('have.value', code);;
			cy.get('[data-cy=confirmAccessButton]').click();


			cy.waitUntil(() => cy.get('[data-cy=privateKeySuccess]').contains('Save your private key in a safe place (never share it).'));

			cy.get('[data-cy=privateKeyValue]').should(($element) => {
				privateKey = $element.text();
			});
	
			cy.get('[data-cy=privateKeyJsonButton]').click();
	
			cy.get('[data-cy=privateKeyJsonMessage]').contains('The private key JSON file is password protected using your wallet password.');
		});


	});

	it('Export Seed Phrase', () => {
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
		cy.get('[data-cy=exportWalletButton]').click();
		cy.get('[data-cy=exportSeedPhraseButton]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;
			cy.get('[data-cy=2faEmailCode]').type(code).should('have.value', code);;
			cy.get('[data-cy=confirmAccessButton]').click();


			cy.waitUntil(() => cy.get('[data-cy=seedPhraseSuccess]').contains('Save your seed phrase in a safe place (never share it).'));
		});

		
	});

	it('Delete Account', () => {
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
		cy.get('[data-cy=exportWalletButton]').click();
		cy.get('[data-cy=exportPrivateKeyButton]').click();

		cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

		cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			const code = response.body.email_verification_code;
			cy.get('[data-cy=2faEmailCode]').type(code).should('have.value', code);;
			cy.get('[data-cy=confirmAccessButton]').click();


			cy.waitUntil(() => cy.get('[data-cy=privateKeySuccess]').contains('Save your private key in a safe place (never share it).'));

			cy.get('[data-cy=exportBackButton]').click();
	
			cy.get('[data-cy=backArrowButton]').click();
	
			cy.get('[data-cy=deleteAccountSettings]').click();
			cy.get('[data-cy=deleteAccountButton]').click();
	
			// cy.get('[data-cy=confirmAccessTitle]').contains('We sent you an email with a code.');

			// cy.request('POST', `${backendUrl}/v1/test/getEmailCode`, { email }).then((response) => {
			// 	const code = response.body.email_verification_code;
			// 	cy.get('[data-cy=2faEmailCode]').type('123456').should('have.value', '123456');;
			// 	cy.get('[data-cy=confirmAccessButton]').click();
	
	
				cy.get('[data-cy=privateKeyOption]').click();
	
				cy.get('[data-cy=privateKeyInput]').type(privateKey).should('have.value', privateKey);
		
				cy.get('[data-cy=confirmDeleteButton]').click();
		
				cy.contains('[data-cy=logInTitle]', 'Log In');
				cy.contains('[data-cy=logInDescription]', 'Unlock your crypto wallet.');
			//});
	

		});


	});
});
