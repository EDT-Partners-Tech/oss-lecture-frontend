/*
 * Copyright 2025 EDT&Partners
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

