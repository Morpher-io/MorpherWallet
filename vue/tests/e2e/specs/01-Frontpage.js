// https://docs.cypress.io/api/introduction/api.html

describe('Front Page', () => {
	it('Open the Root URL', () => {
		cy.visit('/');
		cy.contains('[data-cy=logInTitle]', 'Log In');
		cy.contains('[data-cy=logInDescription]', 'Unlock your crypto wallet.');
	});

	it('Navigate from root to SignUp', () => {
		cy.visit('/');
		cy.get('[data-cy=signUpButton]').click();
		cy.contains('[data-cy=signUpTitle]', 'Sign Up');
		cy.contains('[data-cy=signUpDescription]', 'Create a new wallet.');
	});

	it('Open the Sign Up URL', () => {
		cy.visit('/signup');
		cy.contains('[data-cy=signUpTitle]', 'Sign Up');
		cy.contains('[data-cy=signUpDescription]', 'Create a new wallet.');
	});

	it('Navigate from SignUp to LogIn', () => {
		cy.visit('/signup');
		cy.get('[data-cy=logInButton]').click();
		cy.contains('[data-cy=logInTitle]', 'Log In');
		cy.contains('[data-cy=logInDescription]', 'Unlock your crypto wallet.');
	});
});
