// https://docs.cypress.io/api/introduction/api.html

describe('Change Authenticator', () => {
	const email = '';
	const inbox = '';

    const password = 'Test123!';

    it('error if change twofa authenticator bad code', () => {
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

    	cy.get('[data-cy=openTwoFaChange]').click()

    	cy.get('[data-cy=twoFaAuthenticator]').click()

    	cy.get('[data-cy=generateQR]').click()

    	cy.get('[data-cy=authenticatorCode]').type('123456')

    	cy.get('[data-cy=confirmAuthenticator]').click()

    	cy.get('[data-cy=authenticatorMessage]').contains('Authenticator code seems to be incorrect.')
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

		cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

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
    });

    it('login after authenticator change', () => {
        cy.visit('/');

        cy.get('[data-cy=walletEmail]')
            .type(email)
            .should('have.value', email)

        cy.get('[data-cy=walletPassword]')
            .type(password)
            .should('have.value', password)

        cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.url().should('contain', '/2fa'));

        cy.request('POST', 'http://localhost:8080/v1/test/getUserSecret', { email })
            .then((response) => {
                // response.body is automatically serialized into JSON
                const secret = response.body.authenticator_secret;

                cy.task("generateOTP", secret).then(token => {
                    cy.get('[data-cy=authenticatorCode]').type(token)

                    cy.get('[data-cy=unlock]').click()

					cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

                    cy.get('h1').contains('Morpher Wallet')

                    cy.get('h2').contains('Hello')
                });
            })
    });

	it('disable twofa authenticator', () => {
		cy.visit('/');

		cy.get('[data-cy=walletEmail]')
			.type(email)
			.should('have.value', email)

		cy.get('[data-cy=walletPassword]')
			.type(password)
			.should('have.value', password)

		cy.get('[data-cy=submit]').click()

		cy.waitUntil(() => cy.url().should('contain', '/2fa'));

		cy.request('POST', 'http://localhost:8080/v1/test/getUserSecret', { email })
		.then((response) => {
			// response.body is automatically serialized into JSON
			const secret = response.body.authenticator_secret;

			cy.task("generateOTP", secret).then(token => {
				cy.get('[data-cy=authenticatorCode]').type(token)

				cy.get('[data-cy=unlock]').click()

				cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

				cy.get('h1').contains('Morpher Wallet')

				cy.get('h2').contains('Hello')

				cy.get('[data-cy=settings]').click()

				cy.get('[data-cy=openTwoFaChange]').click()

				cy.get('[data-cy=twoFaAuthenticator]').click()

				cy.get('[data-cy=saveTwoFa]').click()

				cy.get('[data-cy=isSuccess]').contains('Saved')
			});
		})
	});
});