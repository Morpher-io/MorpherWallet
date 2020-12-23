// https://docs.cypress.io/api/introduction/api.html

describe('Change Password', () => {
    const email = '';
    const inbox = '';

    const password = 'Test123!';
    const newPassword = 'Test12345!';

    it('error if bad first password', () => {
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

        cy.get('[data-cy=openPasswordChange]').click()

        cy.get('[data-cy=oldPassword]')
            .type('123456')

        cy.get('[data-cy=newPassword]')
            .type(newPassword)

        cy.get('[data-cy=newPasswordRepeat]')
            .type(newPassword)

        cy.get('[data-cy=passwordSubmit]').click()

        cy.waitUntil(() => cy.get('[data-cy=invalidMessage]').contains('Error happened during Update. Aborted.'));
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

        cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

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

        cy.waitUntil(() => cy.get('[data-cy=confirmed]')
            .contains('Saved'));
    });

    it('login with new password', () => {
        cy.visit('/');

        cy.get('[data-cy=walletEmail]')
            .type(email)
            .should('have.value', email)

        cy.get('[data-cy=walletPassword]')
            .type(newPassword)
            .should('have.value', newPassword)

        cy.get('[data-cy=submit]').click()

        cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

        cy.get('h1').contains('Morpher Wallet')
        cy.get('h2').contains('Hello')
    });

    it('change password back to original', () => {
        cy.visit('/');

        cy.get('[data-cy=walletEmail]')
            .type(email)
            .should('have.value', email)

        cy.get('[data-cy=walletPassword]')
            .type(newPassword)
            .should('have.value', newPassword)

        cy.get('[data-cy=submit]').click()

        cy.waitUntil(() => cy.get('h1').contains('Morpher Wallet'));

        cy.get('h1').contains('Morpher Wallet')
        cy.get('h2').contains('Hello')

        cy.get('[data-cy=settings]').click()

        cy.get('[data-cy=openPasswordChange]').click()

        cy.get('[data-cy=oldPassword]')
            .type(newPassword)

        cy.get('[data-cy=newPassword]')
            .type(password)

        cy.get('[data-cy=newPasswordRepeat]')
            .type(password)

        cy.get('[data-cy=passwordSubmit]').click()

        cy.waitUntil(() => cy.get('[data-cy=confirmed]')
            .contains('Saved'));
    });
});