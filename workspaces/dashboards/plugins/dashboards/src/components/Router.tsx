import React from 'react';
import { Route, Routes } from 'react-router-dom';
import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'

import { dashboardDetailRouteRef } from '../routes';

import { DashboardsPage } from './DashboardsPage';
import { DashboardPage } from './DashboardPage';

const queryClient = new QueryClient()

export const Router = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route
          path="/"
          element={<DashboardsPage />}
        />
        <Route
          path={dashboardDetailRouteRef.path}
          element={<DashboardPage />}
        />
      </Routes>
    </QueryClientProvider>
  );
};
