import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import App from './App';

const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => <App />,
});

const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => <App />,
});

const routeTree = rootRoute.addChildren([indexRoute, catchAllRoute]);

export const router = createRouter({ routeTree });