import { post } from './apiClient';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'super_admin' | 'admin' | 'operations' | 'support';
  avatar?: string;
}

interface LoginResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: AdminUser;
  message?: string;
}

// Demo super-admin credentials for development / internal use.
// This bypasses the backend API. Remove or gate behind an env flag for production.
const SUPER_ADMIN_EMAIL = 'jeetu@manageyourhostel.com';
const SUPER_ADMIN_PASSWORD = '123456';

export const authService = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    if (email === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      return {
        success: true,
        accessToken: 'super-admin-mock-token',
        refreshToken: 'super-admin-mock-refresh-token',
        user: {
          id: 'super-admin',
          name: 'Jeetu',
          email: SUPER_ADMIN_EMAIL,
          role: 'super_admin',
        },
      };
    }

    return await post<LoginResponse>('/admin/auth/login', { email, password });
  },

  refresh: async (refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> => {
    return await post('/admin/auth/refresh', { refreshToken });
  },

  logout: () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    localStorage.removeItem('admin_refresh_token');
  },

  getCurrentUser: (): AdminUser | null => {
    const userStr = localStorage.getItem('admin_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('admin_token');
  }
};
