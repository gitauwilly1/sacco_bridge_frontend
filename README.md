# Sacco Bridge Frontend

## Contributors
- Gitau William

---

## Cooperative Liquidity & Chama Digitization User Experience

Sacco Bridge Frontend is a React-powered interface for a cooperative finance platform that digitizes informal savings groups (Chamas) and enables SACCO share liquidity workflows. The application connects users with cooperative investment opportunities, supports contribution tracking, loan request management, real-time notifications, and administrative oversight.

---

## Problem Statement

The frontend addresses the following challenges in Kenya's cooperative finance ecosystem:

- **Complex onboarding** for informal group members using legacy forms and paperwork
- **Limited visibility** into chama contributions, loan status, and SACCO holdings
- **Slow market matching** for buyers and sellers of SACCO share liquidity
- **Fragmented communication** between members, trustees, and support agents
- **Lack of real-time settlement status** and notification delivery
- **Low trust in digital processes** because of poor auditability and transparency

---

## Solution Overview

The frontend delivers a polished, role-aware experience for members, admins, and investors:

| Feature | Description |
|---------|-------------|
| **Authentication** | Login, registration, password reset, 2FA and Google OAuth flows |
| **Role-aware dashboards** | Member and admin views adapt to PLATFORM_ADMIN, SUPPORT_AGENT, and regular user roles |
| **Chama management** | Create, join, view, and contribute to chamas with contribution forms and meeting tracking |
| **Investment flows** | Browse verified SACCOs, manage holdings, create liquidity requests, and track offers |
| **Settlement and transactions** | View transaction histories, dispute details, ledger entries, and settlements |
| **Real-time notifications** | In-app updates, WebSocket-backed status, and push-ready notification registration |
| **Chatbot support** | AI chat interface for user assistance and knowledge retrieval |
| **Administrative oversight** | User management, SACCO oversight, dispute review, escrow and audit workflows |
| **Responsive UI** | Tailwind CSS, reusable design system components, and skeleton loading states |
| **Offline-aware behavior** | Online/offline status tracking and socket connection management |

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI rendering and component model |
| **Vite** | Fast development and build tooling |
| **Tailwind CSS** | Utility-first styling |
| **@tanstack/react-router** | Client-side routing and nested layouts |
| **@tanstack/react-query** | Server state fetching and caching |
| **Axios** | HTTP client for API requests |
| **Zustand** | Lightweight state management |
| **Zod** | Schema validation for forms |
| **React Hook Form** | Form state handling and validation |
| **Lucide React** | Iconography |
| **Cypress** | End-to-end testing |
| **Vitest** | Unit and integration testing |
| **Workbox** | Service worker support and caching |

---

## Application Structure

The frontend is organized around feature domains:

- `src/features/auth` — authentication pages and flows
- `src/features/chamas` — chama creation, contribution, and member management
- `src/features/investments` — SACCO browsing, holdings, liquidity requests, and offers
- `src/features/transactions` — settlement tracking, disputes, and ledger history
- `src/features/notifications` — notification lists, device registration, and preferences
- `src/features/chatbot` — conversational assistant interface
- `src/features/admin` — admin dashboard, user management, audit logs, and oversight tools
- `src/lib` — shared API client, query client, and utility helpers
- `src/stores` — auth, UI state, socket handling, and notification stores

---

## Local Development

### Prerequisites

- Node.js 20+ or compatible LTS
- npm 10+ or yarn
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/gitauwilly/sacco_bridge_frontend.git
   cd sacco_bridge_frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment variables in a `.env` file:
   ```text
   VITE_API_URL=https://api.example.com
   VITE_WS_URL=wss://api.example.com/ws
   VITE_APP_NAME=Sacco Bridge
   VITE_RECAPTCHA_SITE_KEY=your-recaptcha-site-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

6. Run unit tests:
   ```bash
   npm run test
   ```

7. Open Cypress for E2E tests:
   ```bash
   npm run test:e2e
   ```

8. Run linting:
   ```bash
   npm run lint
   ```

---

## Environment Variables

The frontend relies on these runtime variables:

- `VITE_API_URL` — backend API base URL
- `VITE_WS_URL` — WebSocket gateway URL
- `VITE_APP_NAME` — application display name

---


## License

**License:** MIT License.

---

## Support and Information

**Email:** gitauwilly254@gmail.com
