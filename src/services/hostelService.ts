import { get, post, put, del } from './apiClient';
import { ApiResponse, Hostel } from '../types/api';

export const hostelService = {
  getAll: async (params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<Hostel[]>> => {
    return await get<ApiResponse<Hostel[]>>('/hostel', { params });
  },

  getById: async (id: string): Promise<ApiResponse<Hostel>> => {
    return await get<ApiResponse<Hostel>>(`/hostel/${id}`);
  },

  create: async (hostelData: Partial<Hostel>): Promise<ApiResponse<Hostel>> => {
    return await post<ApiResponse<Hostel>>('/hostel', hostelData);
  },

  update: async (id: string, hostelData: Partial<Hostel>): Promise<ApiResponse<Hostel>> => {
    return await put<ApiResponse<Hostel>>(`/hostel/${id}`, hostelData);
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    return await del<ApiResponse<null>>(`/hostel/${id}`);
  },

  updateVerification: async (id: string, verificationData: { isVerified: boolean; fireSafety?: boolean; cctv?: boolean; policeVerification?: boolean }): Promise<ApiResponse<Hostel>> => {
    return await put<ApiResponse<Hostel>>(`/hostel/${id}/verification`, verificationData);
  },

  getStats: async (): Promise<ApiResponse<any>> => {
    return await get<ApiResponse<any>>('/dashboard/summary');
  }
};