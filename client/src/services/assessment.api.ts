import { ApiResponse, AssessmentData, SelfEvaluationData, PeerReviewData } from '../types/assessment.types';

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

export const fetchStudentAssessments = async (
  studentId: string,
  token: string
): Promise<ApiResponse<{ assessments: AssessmentData[] }>> => {
  const res = await fetch(`${API_BASE}/students/${studentId}/assessments`, {
    headers: getHeaders(token)
  });
  return res.json();
};

export const createAssessmentApi = async (
  studentId: string,
  payload: Partial<AssessmentData>,
  token: string
): Promise<ApiResponse<{ assessment: AssessmentData; levelUpdated: boolean }>> => {
  const res = await fetch(`${API_BASE}/students/${studentId}/assessments`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const patchAssessmentApi = async (
  assessmentId: string,
  payload: Partial<AssessmentData>,
  token: string
): Promise<ApiResponse<{ assessment: AssessmentData; levelUpdated: boolean }>> => {
  const res = await fetch(`${API_BASE}/assessments/${assessmentId}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const createSelfEvaluationApi = async (
  studentId: string,
  payload: Partial<SelfEvaluationData>,
  token: string
): Promise<ApiResponse<{ selfEvaluation: SelfEvaluationData }>> => {
  const res = await fetch(`${API_BASE}/students/${studentId}/self-evaluations`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};

export const createPeerReviewApi = async (
  studentId: string,
  payload: Partial<PeerReviewData>,
  token: string
): Promise<ApiResponse<{ peerReview: PeerReviewData }>> => {
  const res = await fetch(`${API_BASE}/students/${studentId}/peer-reviews`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(payload)
  });
  return res.json();
};
