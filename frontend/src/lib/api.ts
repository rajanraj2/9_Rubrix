import axios from 'axios';

// Types for API request data
interface StudentRegistrationData {
  fullName: string;
  phoneNumber: string;
  schoolCollegeName: string;
  state: string;
  district: string;
  grade: string;
  gender: string;
  pin: string;
}

interface TeacherRegistrationData {
  fullName: string;
  phoneNumber: string;
  schoolCollegeName: string;
  gender: string;
  state: string;
  collegeNumber: string;
  pin: string;
}

interface LoginData {
  email: string;
  role: 'student' | 'teacher'| 'pending';
  pin: string;
}

interface HackathonData {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  uniqueCode?: string;
  parameters: Array<{
    name: string;
    weight: number;
    description: string;
  }>;
  eligibilityCriteria?: Array<{
    criteriaType: 'grade' | 'school' | 'state' | 'phoneNumbers' | 'codeOnly';
    values?: string[];
    phoneNumbers?: string[];
  }>;
  collaborators?: string[];
}

interface SubmissionData {
  hackathonId: string;
  submissionText: string;
  files: Array<{
    filename: string;
    path: string;
    mimetype: string;
  }>;
}

interface EvaluationData {
  evaluation: Array<{
    parameterId: string;
    parameterName: string;
    score: number;
    feedback?: string;
  }>;
  feedback?: string;
}

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Allow cookies to be sent and received
});

// Auth API calls
export const authAPI = {
  registerStudent: (data: StudentRegistrationData) => api.post('/auth/register/student', data),
  registerTeacher: (data: TeacherRegistrationData) => api.post('/auth/register/teacher', data),
  login: (data: LoginData) => api.post('/auth/login', data),
  logout: () => api.get('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Hackathon API calls
export const hackathonAPI = {
  getAllHackathons: () => api.get('/hackathons'),
  getCompletedHackathons: () => api.get('/hackathons/completed'),
  getHackathon: (id: string) => api.get(`/hackathons/${id}`),
  createHackathon: (data: HackathonData) => api.post('/hackathons', data),
  updateHackathon: (id: string, data: Partial<HackathonData>) => api.put(`/hackathons/${id}`, data),
  deleteHackathon: (id: string) => api.delete(`/hackathons/${id}`),
  joinByCode: (code: string) => api.post('/hackathons/join-by-code', { code }),
  addCollaborators: (hackathonId: string, collaboratorPhoneNumbers: string[]) => 
    api.post(`/hackathons/${hackathonId}/collaborators`, { collaboratorPhoneNumbers }),
  registerParticipant: (hackathonId: string, userId: string) => 
    api.post(`/hackathons/${hackathonId}/participants`, { userId }),
  getParticipants: (hackathonId: string) => 
    api.get(`/hackathons/${hackathonId}/participants`),

  getLeaderboard: (hackathonId: string) => 
    api.get(`/hackathons/${hackathonId}/leaderboard`),
  getSubmissions: (hackathonId: string) => 
    api.get(`/hackathons/${hackathonId}/submissions`),
  getShortlisted: (hackathonId: string) => 
    api.get(`/hackathons/${hackathonId}/shortlisted`),
  removeShortlisted: (submissionId: string) =>
    api.post(`/hackathons/remove-shortlisted/${submissionId}`),

};

// Submission API calls
export const submissionAPI = {
  createSubmission: (data: SubmissionData) => api.post('/submissions', data),
  getSubmission: (id: string) => api.get(`/submissions/${id}`),
  evaluateSubmission: (id: string, data: EvaluationData) => api.put(`/submissions/${id}`, data),
  toggleShortlist: (id: string) => api.post(`/submissions/${id}/shortlist`, {}),
  getUserSubmissions: () => api.get('/submissions/my-submissions'),
  getFilePresignedUrl: (submissionId: string, fileIndex: number) => 
    api.get(`/submissions/${submissionId}/file/${fileIndex}/presigned-url`),
};

export default api; 