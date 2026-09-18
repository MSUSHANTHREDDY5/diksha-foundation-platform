import {
  ApiResponse,
  ProgramData,
  ActivityData,
  EnrollmentData,
  TaskData,
  TaskCommentData
} from '../types/program.types';

const API_BASE = '/api';

const getHeaders = (token?: string): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Programs API
export const fetchPrograms = async (
  token: string,
  params?: { category?: string; targetLevel?: string; status?: string }
): Promise<ApiResponse<{ programs: ProgramData[]; pagination: { total: number; page: number; limit: number } }>> => {
  const query = new URLSearchParams(params as any).toString();
  const url = `${API_BASE}/programs${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  return res.json();
};

export const createProgramApi = async (
  payload: Partial<ProgramData>,
  token: string
): Promise<ApiResponse<{ program: ProgramData }>> => {
  const res = await fetch(`${API_BASE}/programs`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

// Enrollments API
export const enrollStudentApi = async (
  programId: string,
  studentId: string,
  token: string
): Promise<ApiResponse<{ enrollment: EnrollmentData }>> => {
  const res = await fetch(`${API_BASE}/programs/${programId}/enrollments`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ studentId })
  });
  return res.json();
};

export const fetchStudentProgramsApi = async (
  studentId: string,
  token: string
): Promise<ApiResponse<{ enrollments: EnrollmentData[] }>> => {
  const res = await fetch(`${API_BASE}/students/${studentId}/programs`, {
    headers: getHeaders(token)
  });
  return res.json();
};

// Activities API
export const fetchProgramActivitiesApi = async (
  programId: string,
  token: string
): Promise<ApiResponse<{ activities: ActivityData[] }>> => {
  const res = await fetch(`${API_BASE}/programs/${programId}/activities`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const createActivityApi = async (
  programId: string,
  payload: Partial<ActivityData>,
  token: string
): Promise<ApiResponse<{ activity: ActivityData }>> => {
  const res = await fetch(`${API_BASE}/programs/${programId}/activities`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

// Tasks API
export const fetchTasksApi = async (
  token: string,
  params?: { studentId?: string; programId?: string; status?: string }
): Promise<ApiResponse<{ tasks: TaskData[]; pagination: { total: number; page: number; limit: number } }>> => {
  const query = new URLSearchParams(params as any).toString();
  const url = `${API_BASE}/tasks${query ? `?${query}` : ''}`;
  const res = await fetch(url, { headers: getHeaders(token) });
  return res.json();
};

export const createTaskApi = async (
  payload: Partial<TaskData>,
  token: string
): Promise<ApiResponse<{ task: TaskData }>> => {
  const res = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const patchTaskApi = async (
  taskId: string,
  payload: Partial<TaskData>,
  token: string
): Promise<ApiResponse<{ task: TaskData }>> => {
  const res = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const addTaskCommentApi = async (
  taskId: string,
  message: string,
  token: string
): Promise<ApiResponse<{ comment: TaskCommentData; task: TaskData }>> => {
  const res = await fetch(`${API_BASE}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify({ message })
  });
  return res.json();
};
