describe('Chamas E2E Flows', () => {
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

  it('Flow: Visit chamas list, create chama, view details, record contribution', () => {
    const mockChamas = [
      { id: 101, name: 'Mavuno Welfare Group', role: 'President', balance: 250000, standing: 'Active' },
      { id: 102, name: 'Upendo Women Circle', role: 'Member', balance: 80000, standing: 'Active' }
    ];

    // Mock chama listing
    cy.intercept('GET', '**/chamas/', {
      statusCode: 200,
      body: { data: mockChamas }
    }).as('getChamas');

    // Intercept default dashboard analytics
    cy.intercept('GET', '**/analytics/dashboard/user/', {
      statusCode: 200,
      body: { data: { summary: { total_savings: 330000, total_chamas: 2, total_settlement_volume: 0 } } },
    });
    cy.intercept('GET', '**/activity/**', { statusCode: 200, body: [] });
    cy.intercept('GET', '**/notifications/unread_count/', { statusCode: 200, body: { unread_count: 0 } });
    cy.intercept('GET', '**/investments/holdings/', { statusCode: 200, body: [] });

    // 1. Visit /chamas
    cy.visit('/chamas');
    cy.wait('@getChamas');
    cy.get('h1').should('contain', 'My Chamas');
    cy.contains('Mavuno Welfare Group').should('exist');
    cy.contains('Upendo Women Circle').should('exist');

    // 2. Click "Create Chama"
    cy.intercept('POST', '**/chamas/', {
      statusCode: 201,
      body: {
        data: { id: 103, name: 'Kilimo Investment Club' }
      }
    }).as('createChamaRequest');

    cy.get('button#create-chama-btn').click();
    cy.url().should('include', '/chamas/new');
    cy.get('h1').should('contain', 'Create Chama');

    // Fill Create Chama Form
    cy.get('input[name="chama_name"]').type('Kilimo Investment Club');
    cy.get('[data-slot="select-trigger"]').eq(0).click();
    cy.get('[data-slot="select-item"]').contains('Investment Club').click();
    cy.get('textarea[name="description"]').type('A community agriculture investment club.');
    cy.get('input[name="contribution_amount"]').type('5000');
    cy.get('[data-slot="select-trigger"]').eq(1).click();
    cy.get('[data-slot="select-item"]').contains('Monthly').click();
    cy.get('input[name="max_members"]').type('30');

    // Intercept detail page dependencies (which requests the dashboard data)
    cy.intercept('GET', '**/chamas/103/dashboard/', {
      statusCode: 200,
      body: {
        data: {
          id: 103,
          chama_name: 'Kilimo Investment Club',
          chama_type: 'Investment Club',
          description: 'A community agriculture investment club.',
          contribution_amount: 5000,
          contribution_frequency: 'MONTHLY',
          max_members: 30,
          balance: 0,
          total_members: 1,
          total_savings: 0,
          outstanding_loans: 0,
          available_balance: 0,
          health: { grade: 'A', score: 95 },
          recent_contributions: [],
          upcoming_meetings: []
        }
      }
    }).as('getChamaDetail');

    cy.intercept('GET', '**/chamas/103/members/**', {
      statusCode: 200,
      body: {
        data: [
          { id: 1, user_name: 'Jane Doe', first_name: 'Jane', last_name: 'Doe', role: 'MEMBER', phone_number: '0712345678', total_contributions: 1000 }
        ]
      }
    }).as('getMembers');

    cy.intercept('GET', '**/chamas/103/contributions/**', {
      statusCode: 200,
      body: { data: [] }
    }).as('getContributions');

    // Submit form
    cy.get('button[type="submit"]').click();
    cy.wait('@createChamaRequest');

    // 3. Redirected to Chama Detail Page
    cy.url().should('include', '/chamas/103');
    cy.wait('@getChamaDetail');
    cy.get('h1').should('contain', 'Kilimo Investment Club');

    // View Members tab
    cy.get('button[role="tab"]').contains('Members').click();
    cy.wait('@getMembers');
    cy.contains('Jane Doe').should('exist');

    // View Contributions tab
    cy.get('button[role="tab"]').contains('Contributions').click();
    cy.wait('@getContributions');
    
    // 4. Click record contribution
    cy.intercept('POST', '**/chamas/103/contributions/', {
      statusCode: 201,
      body: { success: true, message: 'Contribution recorded.' }
    }).as('recordContribution');

    cy.contains('Contribute').click();
    cy.url().should('include', '/chamas/103/contribute');
    cy.get('h1').should('contain', 'Record Contribution');

    // Fill contribution details
    cy.get('input[name="amount"]').type('5000', { force: true });
    // Select member by clicking member button containing Jane Doe
    cy.contains('Jane Doe').click({ force: true });
    // Fill dates
    cy.get('input[name="period_start"]').type('2026-06-01', { force: true });
    cy.get('input[name="period_end"]').type('2026-06-30', { force: true });
    // Select payment method
    cy.get('[data-slot="select-trigger"]').first().click({ force: true });
    cy.get('[data-slot="select-item"]').contains('M-Pesa').click({ force: true });
    
    // Submit contribution
    cy.get('button[type="submit"]').click({ force: true });
    cy.wait('@recordContribution');
    
    // Toast notification and redirect back to Chama details
    cy.url().should('include', '/chamas/103');
  });
});
