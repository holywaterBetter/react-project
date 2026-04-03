
import { MainLayout } from '@layouts/MainLayout';
import { AboutPage } from '@pages/AboutPage';
import { HomePage } from '@pages/HomePage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { OrganizationWorkforceDashboardPage } from '@pages/organization-workforce-dashboard/OrganizationWorkforceDashboardPage';
import { OrganizationWorkforceInsightPage } from '@pages/organization-workforce-insight/OrganizationWorkforceInsightPage';
import { OrganizationSelectionPage } from '@pages/OrganizationSelectionPage';
import { createHashRouter, RouterProvider } from 'react-router-dom';

const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />
      },
      {
        path: 'about',
        element: <AboutPage />
      },
      {
        path: 'organizations',
        element: <OrganizationSelectionPage />
      },
      {
        path: 'organization/workforce-dashboard',
        element: <OrganizationWorkforceDashboardPage />
      },
      {
        path: 'organization/workforce-insight',
        element: <OrganizationWorkforceInsightPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
