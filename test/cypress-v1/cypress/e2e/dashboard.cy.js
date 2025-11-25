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

import { login } from './login.cy';

describe('Dashboard Tests', () => {
  beforeEach(() => {
    // Reuse the login functionality
    login(Cypress.env('CYPRESS_VALID_EMAIL'), Cypress.env('CYPRESS_VALID_PASSWORD'));
  });

  it('should display the In-doc Translation button', () => {
    cy.contains('In-doc Translation').should('be.visible');
  });

  it('should display the Exam Questions Generator button', () => {
    cy.contains('Exam Questions Generator').should('be.visible');
  });

  it('should display the Content Chat button', () => {
    cy.contains('Content Chat').should('be.visible');
  });

  it('should display the Transcriber button', () => {
    cy.contains('Transcriber').should('be.visible');
  });

  it('should display the AI Rich Text Editor button', () => {
    cy.contains('AI Rich Text Editor').should('be.visible');
  });

  it('should display the Evaluations button', () => {
    cy.contains('Evaluations').should('be.visible');
  });

  it('should display the Podcast Generator button', () => {
    cy.contains('Podcast Generator').should('be.visible');
  });

  it('should display the Comparison Engine button', () => {
    cy.contains('Comparison Engine').should('be.visible');
  });

  it('should display the Knowledge Bases button', () => {
    cy.contains('Knowledge Bases').should('be.visible');
  });
});