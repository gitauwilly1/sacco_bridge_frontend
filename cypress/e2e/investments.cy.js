describe('Investments E2E Flows', () => {
  beforeEach(() => {
    // Mock authentication
    cy.intercept('POST', '**/auth/token/refresh/', {
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
    });

    cy.window().then((win) => {
      win.localStorage.setItem('sacco-auth', JSON.stringify({
        state: {
          user: {
            id: 1,
            email: 'jane.doe@example.com',
            first_name: 'Jane',
            last_name: 'Doe',
            role: 'member',
          },
          isAuthenticated: true,
        },
        version: 0,
      }));
    });
  });

  it('Flow: Browse SACCOs, view detail, view holdings, create liquidity request', () => {
    const mockSaccos = [
      { id: 1, name: 'Stima SACCO', tier: 1, location: 'Nairobi', description: 'Stima SACCO description.' },
      { id: 2, name: 'Safaricom SACCO', tier: 1, location: 'Nairobi', description: 'Safaricom SACCO description.' }
    ];

    const mockShareClasses = [
      { id: 11, name: 'Stima Class A Shares', price_per_share: 150, description: 'Class A description.' },
      { id: 12, name: 'Stima Class B Shares', price_per_share: 100, description: 'Class B description.' }
    ];

    const mockHoldings = [
      {
        id: 201,
        sacco_id: 1,
        sacco_name: 'Stima SACCO',
        share_class_id: 11,
        share_class_name: 'Stima Class A Shares',
        quantity_owned: 1000,
        available_to_sell: 800,
        estimated_value: 150000,
        dividend_yield: 12
      }
    ];

    // Intercept default dashboard analytics
    cy.intercept('GET', '**/analytics/dashboard/user/', {
      statusCode: 200,
      body: { data: { summary: { total_savings: 150000, total_chamas: 0, total_settlement_volume: 0 } } },
    });
    cy.intercept('GET', '**/activity/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/notifications/unread_count/', { statusCode: 200, body: { unread_count: 0 } });

    // Mock SACCOs endpoint
    cy.intercept('GET', '**/investments/saccos/**', {
      statusCode: 200,
      body: { data: mockSaccos }
    }).as('getSaccos');

    // 1. Visit /investments
    cy.visit('/investments');
    cy.wait('@getSaccos');
    cy.contains('SACCOs').should('exist');
    cy.contains('Stima SACCO').should('exist');
    cy.contains('Safaricom SACCO').should('exist');

    // 2. Click SACCO to see detail
    cy.intercept('GET', '**/investments/saccos/1/', {
      statusCode: 200,
      body: { data: mockSaccos[0] }
    }).as('getSaccoDetail');

    cy.intercept('GET', '**/investments/saccos/1/share_classes/**', {
      statusCode: 200,
      body: { data: mockShareClasses }
    }).as('getShareClasses');

    cy.contains('Stima SACCO').click();
    cy.wait('@getSaccoDetail');
    cy.wait('@getShareClasses');
    cy.get('h1').should('contain', 'Stima SACCO');
    
    // Click the Share Classes tab
    cy.get('button[role="tab"]').contains('Share Classes').click();
    cy.contains('Stima Class A Shares').should('exist');
    cy.contains('Stima Class B Shares').should('exist');

    // 3. Navigate to Holdings
    cy.intercept('GET', '**/investments/holdings/**', {
      statusCode: 200,
      body: { data: mockHoldings }
    }).as('getHoldings');

    cy.intercept('GET', '**/investments/holdings/concentration_check/', {
      statusCode: 200,
      body: {
        data: {
          diversification_score: 80,
          total_value: 150000,
          percentage_change: 12,
          total_saccos: 1,
          total_holdings: 1,
          warnings: []
        }
      }
    });

    cy.visit('/holdings');
    cy.wait('@getHoldings');
    cy.contains('Total Portfolio Value').should('exist');
    cy.contains('Stima SACCO').should('exist');
    cy.contains('1,000 shares').should('exist');

    // 4. Create liquidity request
    cy.intercept('GET', '**/investments/requests/**', {
      statusCode: 200,
      body: { data: [] }
    }).as('getRequests');

    cy.visit('/investments/requests');
    cy.wait('@getRequests');
    cy.contains('Sell Shares').click();

    // Verify Sell form fields render
    cy.url().should('include', '/investments/sell');
    cy.get('h1').should('contain', 'Sell Shares');

    // Select SACCO
    cy.get('[data-slot="select-trigger"]').eq(0).click();
    cy.contains('[data-slot="select-item"]', 'Stima SACCO').should('be.visible').click({ force: true });

    // Select Share Class
    cy.get('[data-slot="select-trigger"]').eq(1).click();
    cy.contains('[data-slot="select-item"]', 'Stima Class A Shares').should('be.visible').click({ force: true });

    // Enter quantity and price
    cy.get('input[name="quantity"]').type('200');
    cy.get('input[name="price_per_share"]').type('150');
    
    // Select urgency
    cy.get('[data-slot="select-trigger"]').eq(2).click();
    cy.contains('[data-slot="select-item"]', 'Standard (1 week)').should('be.visible').click({ force: true });

    // Intercept form post
    cy.intercept('POST', '**/investments/requests/', {
      statusCode: 201,
      body: { success: true, message: 'Request created.' }
    }).as('createRequest');

    // Submit request
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait('@createRequest');

    // Redirected back to requests list
    cy.url().should('include', '/investments/requests');
  });
});
