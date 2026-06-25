describe('RBAC and New Pages E2E Flows', () => {
  const adminUser = {
    id: 99,
    email: 'admin@saccobridge.co.ke',
    first_name: 'Admin',
    last_name: 'User',
    role: 'PLATFORM_ADMIN',
    roles: ['PLATFORM_ADMIN'],
  };

  const memberUser = {
    id: 1,
    email: 'jane.doe@example.com',
    first_name: 'Jane',
    last_name: 'Doe',
    role: 'member',
    roles: ['MEMBER'],
  };

  describe('1. Member Role - Access Control Checks', () => {
    beforeEach(() => {
      // Mock refresh token returning Member user
      cy.intercept('POST', '**/auth/token/refresh/', {
        statusCode: 200,
        body: {
          data: {
            access_token: 'mock-member-token',
            user: memberUser,
          },
        },
      });

      // Set member auth state in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('sacco-auth', JSON.stringify({
          state: {
            user: memberUser,
            isAuthenticated: true,
          },
          version: 0,
        }));
      });

      // Intercept normal member dashboard APIs
      cy.intercept('GET', '**/analytics/dashboard/user/', {
        statusCode: 200,
        body: { data: { summary: { total_savings: 5000, total_chamas: 1, total_settlement_volume: 0 } } },
      });
      cy.intercept('GET', '**/activity/**', { statusCode: 200, body: [] });
      cy.intercept('GET', '**/notifications/unread_count/', { statusCode: 200, body: { unread_count: 0 } });
      cy.intercept('GET', '**/investments/holdings/', { statusCode: 200, body: [] });
      cy.intercept('GET', '**/chamas/', { statusCode: 200, body: [] });
    });

    it('Should redirect a standard Member to "/" when they try to access "/admin"', () => {
      cy.visit('/admin');
      cy.url().should('eq', Cypress.config().baseUrl + '/');
      cy.contains('Dashboard').should('exist');
      cy.contains('Jane').should('exist');
    });
  });

  describe('2. Admin Role - Access Control and Page Views', () => {
    beforeEach(() => {
      // Mock refresh token returning Admin user
      cy.intercept('POST', '**/auth/token/refresh/', {
        statusCode: 200,
        body: {
          data: {
            access_token: 'mock-admin-token',
            user: adminUser,
          },
        },
      });

      // Set admin auth state in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('sacco-auth', JSON.stringify({
          state: {
            user: adminUser,
            isAuthenticated: true,
          },
          version: 0,
        }));
      });

      // Mock Admin Dashboard Analytics
      cy.intercept('GET', '**/analytics/dashboard/platform/', {
        statusCode: 200,
        body: {
          data: {
            total_users: 1450,
            active_chamas: 23,
            total_volume: 8500000,
            open_disputes: 3,
            recent_activity: [
              { id: 1, action: 'User Signup', description: 'Jane Doe registered on the platform.', timestamp: new Date().toISOString() },
              { id: 2, action: 'Chama Created', description: 'Mavuno Welfare Group was successfully registered.', timestamp: new Date().toISOString() },
            ],
          },
        },
      }).as('getPlatformAnalytics');

      // Mock other Admin endpoints with proper mock data shapes
      cy.intercept('GET', '**/users/admin/manage/**', {
        statusCode: 200,
        body: { data: [{ id: 1, first_name: 'Jane', last_name: 'Doe', email: 'jane.doe@example.com', roles: ['MEMBER'], is_active: true, created_at: new Date().toISOString() }] },
      }).as('getUsersAdmin');

      cy.intercept('GET', '**/investments/saccos/admin/**', {
        statusCode: 200,
        body: { data: [{ id: 1, name: 'Stima SACCO', sasra_tier: 1, location: 'Nairobi', verified: true, registration_number: 'CS/1234' }] },
      }).as('getSaccosAdmin');

      cy.intercept('GET', '**/chamas/admin/manage/**', {
        statusCode: 200,
        body: { data: [{ id: 101, chama_name: 'Mavuno Welfare Group', chama_type: 'Investment Club', balance: 250000, status: 'active' }] },
      }).as('getChamasAdmin');

      cy.intercept('GET', '**/transactions/disputes/**', {
        statusCode: 200,
        body: { data: [{ id: 1, transaction_id: 'TXN100', settlement_amount: 15000, status: 'open', raised_by: 'Jane Doe', reason: 'Delayed settlement', description: 'Delayed settlement' }] },
      }).as('getDisputesAdmin');

      cy.intercept('GET', '**/fraud/assessments/**', {
        statusCode: 200,
        body: { data: [{ id: 1, user_name: 'John Doe', risk_level: 'high', status: 'pending', amount: 50000, type: 'Transfer', created_at: new Date().toISOString() }] },
      }).as('getFraudAdmin');

      cy.intercept('GET', '**/escrow/held/**', {
        statusCode: 200,
        body: { data: [{ id: 1, transaction_id: 'TXN100', amount: 15000, status: 'HELD', buyer_name: 'Jane Doe', seller_name: 'John Doe' }] },
      }).as('getEscrowAdmin');

      cy.intercept('GET', '**/users/admin/unified-audit/**', {
        statusCode: 200,
        body: { data: [{ id: 1, user_email: 'admin@saccobridge.co.ke', action_type: 'UPDATE', actor_name: 'Admin User', description: 'Assigned SUPPORT_AGENT role to user ID 2', timestamp: new Date().toISOString() }] },
      }).as('getUnifiedAuditAdmin');

      cy.intercept('GET', '**/users/admin/deletion-requests/**', {
        statusCode: 200,
        body: { data: [] },
      });

      cy.intercept('GET', '**/webhooks/subscriptions/**', {
        statusCode: 200,
        body: { data: [{ id: 1, url: 'https://api.partner.com/webhook', events: ['chama.created'], status: 'active' }] },
      }).as('getWebhooksAdmin');

      cy.intercept('GET', '**/legal/admin/**', {
        statusCode: 200,
        body: { data: [{ id: 1, version: '1.0.0', is_published: true, created_at: new Date().toISOString() }] },
      }).as('getLegalAdmin');

      cy.intercept('GET', '**/reports/**', {
        statusCode: 200,
        body: { data: [{ id: 1, name: 'Q2 Performance Summary', type: 'financial', generated_at: new Date().toISOString() }] },
      }).as('getReportsAdmin');
    });

    it('Should redirect an Admin from "/" to "/admin" and view the dashboard', () => {
      cy.visit('/');
      cy.url().should('include', '/admin');
      cy.wait('@getPlatformAnalytics');
      cy.contains('Admin Dashboard').should('exist');
      cy.contains('Total Users').should('exist');
      cy.contains('1,450').should('exist');
    });

    it('Should navigate through all Administrative routes successfully', () => {
      cy.visit('/admin');
      cy.wait('@getPlatformAnalytics');

      // 1. Users management page
      cy.visit('/admin/users');
      cy.wait('@getUsersAdmin');
      cy.contains('jane.doe@example.com').should('exist');

      // 2. SACCOs management page
      cy.visit('/admin/saccos');
      cy.wait('@getSaccosAdmin');
      cy.contains('Stima SACCO').should('exist');

      // 3. Chamas management page
      cy.visit('/admin/chamas');
      cy.wait('@getChamasAdmin');
      cy.contains('Mavuno Welfare Group').should('exist');

      // 4. Disputes management page
      cy.visit('/admin/disputes');
      cy.wait('@getDisputesAdmin');
      cy.contains('Delayed settlement').should('exist');

      // 5. Fraud reviews page
      cy.visit('/admin/fraud');
      cy.wait('@getFraudAdmin');
      cy.contains('John Doe').should('exist');

      // 6. Escrow management page
      cy.visit('/admin/escrow');
      cy.wait('@getEscrowAdmin');
      cy.contains('HELD').should('exist');

      // 7. Audit log page
      cy.visit('/admin/audit');
      cy.wait('@getUnifiedAuditAdmin');
      cy.contains('UPDATE').should('exist');

      // 8. Webhooks management page
      cy.visit('/admin/webhooks');
      cy.wait('@getWebhooksAdmin');
      cy.contains('https://api.partner.com/webhook').should('exist');

      // 9. Legal documents page
      cy.visit('/admin/legal');
      cy.wait('@getLegalAdmin');
      cy.contains('v1.0.0').should('exist');

      // 10. Reports page
      cy.visit('/admin/reports');
      cy.wait('@getReportsAdmin');
      cy.contains('Q2 Performance Summary').should('exist');
    });
  });

  describe('3. Static and Profile Routing checks', () => {
    beforeEach(() => {
      // Mock refresh token returning Member user (so standard Shell layout displays)
      cy.intercept('POST', '**/auth/token/refresh/', {
        statusCode: 200,
        body: {
          data: {
            access_token: 'mock-member-token',
            user: memberUser,
          },
        },
      });

      // Set member auth state in localStorage
      cy.window().then((win) => {
        win.localStorage.setItem('sacco-auth', JSON.stringify({
          state: {
            user: memberUser,
            isAuthenticated: true,
          },
          version: 0,
        }));
      });

      // Intercept member dashboard calls
      cy.intercept('GET', '**/analytics/dashboard/user/', {
        statusCode: 200,
        body: { data: { summary: { total_savings: 5000, total_chamas: 1, total_settlement_volume: 0 } } },
      });
      cy.intercept('GET', '**/activity/**', { statusCode: 200, body: [] });
      cy.intercept('GET', '**/notifications/unread_count/', { statusCode: 200, body: { unread_count: 0 } });

      // Mock user profile API call
      cy.intercept('GET', '**/users/profile/', {
        statusCode: 200,
        body: {
          data: {
            id: 1,
            first_name: 'Jane',
            last_name: 'Doe',
            full_name: 'Jane Doe',
            email: 'jane.doe@example.com',
            phone_number: '0712345678',
            trust_score: 95,
            is_active: true
          }
        }
      }).as('getUserProfile');
    });

    it('Should load /help page with FAQs correctly', () => {
      cy.visit('/help');
      cy.get('h1').should('contain', 'Help Center & FAQ');
      cy.contains('How do I link my SACCO account to Sacco Bridge?').should('exist');
    });

    it('Should load /settings routing pointing to ProfilePage appearance tab', () => {
      cy.visit('/settings');
      cy.wait('@getUserProfile');
      cy.contains('Appearance').should('exist');
      cy.contains('Customize how Sacco Bridge looks').should('exist');
      cy.contains('[role="tab"]', 'Appearance').should('have.attr', 'data-state', 'active');
    });

    it('Should load /security routing pointing to ProfilePage security tab', () => {
      cy.visit('/security');
      cy.wait('@getUserProfile');
      cy.contains('Connected Accounts').should('exist');
      cy.contains('[role="tab"]', 'Security').should('have.attr', 'data-state', 'active');
    });

    it('Should display 404 page when visiting a non-existent path', () => {
      cy.visit('/this-route-does-not-exist-at-all');
      cy.contains('Page Not Found').should('exist');
      cy.contains('Dashboard Home').should('exist');
    });
  });
});
