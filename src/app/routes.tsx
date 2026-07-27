import { createBrowserRouter } from 'react-router';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { PublicRoute } from './components/PublicRoute';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { HostelManagement } from './pages/HostelManagement';
import { HostelOnboarding } from './pages/HostelOnboarding';
import { Tenants } from './pages/Tenants';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { Complaints } from './pages/Complaints';
import { Notifications } from './pages/Notifications';
import { AIAutomation } from './pages/AIAutomation';
import { Content } from './pages/Content';
import { Roles } from './pages/Roles';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { IdCardGenerator } from './pages/IdCardGenerator';
import { HostelCSVUpload } from './pages/HostelCSVUpload';
import { BulkAddRooms } from './pages/BulkAddRooms';
import { HostelOwnerVerification } from './pages/HostelOwnerVerification';
import { HostelOwnerDetail } from './pages/HostelOwnerDetail';
import { HostelDetail } from './pages/HostelDetail';
import { AppVersionSettings } from './pages/AppVersionSettings';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    )
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'hostel-management', Component: HostelManagement },
      { path: 'hostel-management/:id', Component: HostelDetail },
      { path: 'hostel-onboarding', Component: HostelOnboarding },
      { path: 'hostel-csv-upload', Component: HostelCSVUpload },
      { path: 'bulk-add-rooms', Component: BulkAddRooms },
      { path: 'hostel-owner-verification', Component: HostelOwnerVerification },
      { path: 'hostel-owner-verification/:id', Component: HostelOwnerDetail },
      { path: 'tenants', Component: Tenants },
      { path: 'bookings', Component: Bookings },
      { path: 'payments', Component: Payments },
      { path: 'expenses', Component: Expenses },
      { path: 'complaints', Component: Complaints },
      { path: 'notifications', Component: Notifications },
      { path: 'ai-automation', Component: AIAutomation },
      { path: 'content', Component: Content },
      { path: 'roles', Component: Roles },
      { path: 'reports', Component: Reports },
      { path: 'settings', Component: Settings },
      { path: 'app-version', Component: AppVersionSettings },
      { path: 'id-card-generator', Component: IdCardGenerator }
    ]
  },
  {
    path: '*',
    Component: NotFound
  }
]);