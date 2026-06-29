import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from '@tanstack/react-router';
import queryClient from './lib/queryClient';
import { router } from './router';
import ThemeProvider from './components/providers/ThemeProvider';
import AppearanceProvider from './components/providers/AppearanceProvider';
import './lib/i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AppearanceProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </AppearanceProvider>
    </ThemeProvider>
  </React.StrictMode>
);