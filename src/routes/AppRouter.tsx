
import { MainLayout } from '@layouts/MainLayout';
import { AboutPage } from '@pages/AboutPage';
import { HomePage } from '@pages/HomePage';
import { NotFoundPage } from '@pages/NotFoundPage';
import { OrganizationApprovalDetailPage } from '@pages/organization-approval/OrganizationApprovalDetailPage';
import { OrganizationApprovalListPage } from '@pages/organization-approval/OrganizationApprovalListPage';
import { OrganizationWorkforceDashboardPage } from '@pages/organization-workforce-dashboard/OrganizationWorkforceDashboardPage';
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
        path: 'organization/approval',
        element: <OrganizationApprovalListPage />
      },
      {
        path: 'organization/approval/:id',
        element: <OrganizationApprovalDetailPage />
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);

export const AppRouter = () => <RouterProvider router={router} />;
