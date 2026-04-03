
import { MainLayout } from '@layouts/MainLayout';
import { AboutPage } from '@pages/AboutPage';
import { HomePage } from '@pages/HomePage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { OrganizationSelectionPage } from '@pages/OrganizationSelectionPage';
import { OrganizationWorkforceDashboardPage } from '@pages/organization-workforce-dashboard/OrganizationWorkforceDashboardPage';
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
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
