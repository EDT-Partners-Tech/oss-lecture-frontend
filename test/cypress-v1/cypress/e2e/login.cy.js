// © [2025] EDT&Partners. Licensed under CC BY 4.0.
export const login = (email, password) => {
  cy.visit(Cypress.env('CYPRESS_LOGIN_URL'));
  cy.wait(1500); // Wait for content to load

  // Input username and password
  cy.get('input#email').type(email);
  cy.get('input#password').type(password);

  // Submit the login form
  cy.get('button[type="submit"]').click();

  // Wait for navigation
  cy.url().should('include', '/dashboard');
};

