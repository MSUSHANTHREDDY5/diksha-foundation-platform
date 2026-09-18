import {
  ApiResponse,
  DashboardData,
  StudentAnalyticsData,
  ProgramAnalyticsData,
  AssessmentAnalyticsData,
  StudentReportItem,
  ProgramReportItem
} from '../types/admin.types';

const API_BASE = '/api/admin';

const getHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const fetchAdminDashboard = async (
  token: string,
  centre?: string
): Promise<ApiResponse<DashboardData>> => {
  const query = centre ? `?centre=${encodeURIComponent(centre)}` : '';
  const res = await fetch(`${API_BASE}/dashboard${query}`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const fetchStudentAnalytics = async (
  token: string,
  params?: { centre?: string; learningLevel?: string; status?: string }
): Promise<ApiResponse<StudentAnalyticsData>> => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/analytics/students${query ? `?${query}` : ''}`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const fetchProgramAnalytics = async (
  token: string,
  params?: { category?: string; status?: string }
): Promise<ApiResponse<ProgramAnalyticsData>> => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/analytics/programs${query ? `?${query}` : ''}`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const fetchAssessmentAnalytics = async (
  token: string,
  params?: { category?: string }
): Promise<ApiResponse<AssessmentAnalyticsData>> => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/analytics/assessments${query ? `?${query}` : ''}`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const fetchStudentReports = async (
  token: string,
  params?: { centre?: string; learningLevel?: string; status?: string; page?: number; limit?: number }
): Promise<ApiResponse<{ reports: StudentReportItem[]; pagination: { total: number; page: number; limit: number } }>> => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/reports/students${query ? `?${query}` : ''}`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const fetchProgramReports = async (
  token: string,
  params?: { category?: string; status?: string; page?: number; limit?: number }
): Promise<ApiResponse<{ reports: ProgramReportItem[]; pagination: { total: number; page: number; limit: number } }>> => {
  const query = new URLSearchParams(params as any).toString();
  const res = await fetch(`${API_BASE}/reports/programs${query ? `?${query}` : ''}`, {
    headers: getHeaders(token)
  });
  return res.json();
};
