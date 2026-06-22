describe('Authentication Flows', () => {
  beforeEach(() => {
    // Intercept default token initialization to simulate unauthenticated state on load
    cy.intercept('POST', '**/auth/token/refresh/', {
      statusCode: 200,
      body: { data: { access_token: null } },
    }).as('refreshToken');
  });

  it('1. Visit / and verify login form displays', () => {
    cy.visit('/');
    cy.wait('@refreshToken');
    cy.get('h1').should('contain', 'Welcome Back');
    cy.get('input[type="email"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button#login-submit-btn').should('exist');
  });

  it('2. Fill email + password -> submit -> verify dashboard redirection', () => {
    // Mock login endpoint
    cy.intercept('POST', '**/auth/login/', {
      statusCode: 200,
      body: {
        data: {
          access_token: 'mock-access-token',
          user: {
            id: 1,
            email: 'jane.doe@example.com',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'member',
          },
        },
      },
    }).as('loginRequest');

    // Mock subsequent dashboard API calls
    cy.intercept('GET', '**/analytics/dashboard/user/', {
      statusCode: 200,
      body: { data: { summary: { total_savings: 5000, total_chamas: 1, total_settlement_volume: 0 } } },
    });
    cy.intercept('GET', '**/activity/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/notifications/unread_count/', { statusCode: 200, body: { unread_count: 0 } });
    cy.intercept('GET', '**/investments/holdings/', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/chamas/', { statusCode: 200, body: [] });

    cy.visit('/');
    cy.get('input[type="email"]').type('jane.doe@example.com');
    cy.get('input[type="password"]').type('Password123!');
    cy.get('button#login-submit-btn').click();

    cy.wait('@loginRequest');
    
    // Check elements on Dashboard
    cy.get('header').should('exist');
    cy.contains('Jane').should('exist');
  });

  it('3. Navigate to registration form, fill details, and submit to see verification prompt', () => {
    cy.intercept('POST', '**/auth/register/', {
      statusCode: 201,
      body: { success: true, message: 'Verification code sent.' },
    }).as('registerRequest');

    cy.visit('/');
    cy.get('button#switch-to-register-btn').click();
    
    cy.get('h1').should('contain', 'Create Account');

    cy.get('input[name="first_name"]').type('Jane');
    cy.get('input[name="last_name"]').type('Doe');
    cy.get('input[name="email"]').type('jane.doe@example.com');
    cy.get('input[name="phone_number"]').type('0712345678');
    cy.get('input[name="password"]').type('SecureP@ss123');
    cy.get('input[name="password_confirm"]').type('SecureP@ss123');

    // Click terms checkboxes
    cy.get('button[role="checkbox"]').eq(0).click();
    cy.get('button[role="checkbox"]').eq(1).click();

    cy.get('button#register-submit-btn').click();
    cy.wait('@registerRequest');

    // Verification code view displays
    cy.get('h1').should('contain', 'Verify Your Email');
  });

  it('4. Click Forgot password? -> verify reset form displays', () => {
    cy.visit('/');
    cy.contains('Forgot password?').click();
    cy.get('h1').should('contain', 'Reset Password');
    cy.get('input[type="email"]').should('exist');
    cy.contains('Back to login').should('exist');
  });
});
