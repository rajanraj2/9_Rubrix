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
  schoolName: string;
  gender: string;
  state: string;
  collegeNumber: string;
  pin: string;
}

interface LoginData {
  phoneNumber: string;
  pin: string;
  role: 'student' | 'teacher';
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
  getLeaderboard: (hackathonId: string) => {
    console.log(`Fetching leaderboard for hackathon: ${hackathonId}`);
    return api.get(`/hackathons/${hackathonId}/leaderboard`).then(response => {
      console.log('Leaderboard API response:', response);
      return response;
    }).catch(error => {
      console.error('Leaderboard API error:', error);
      throw error;
    });
  },
  getSubmissions: (hackathonId: string) => 
    api.get(`/hackathons/${hackathonId}/submissions`),
  getShortlisted: (hackathonId: string) => {
    console.log(`Fetching shortlisted for hackathon: ${hackathonId}`);
    return api.get(`/hackathons/${hackathonId}/shortlisted`).then(response => {
      console.log('Shortlisted API response:', response);
      return response;
    }).catch(error => {
      console.error('Shortlisted API error:', error);
      throw error;
    });
  },
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