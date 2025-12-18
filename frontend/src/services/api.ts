import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('mentora_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export interface UploadResponse {
  message: string;
  filename: string;
  file_path: string;
  file_size: number;
}

export interface TranscribeResponse {
  transcribed_text: string;
  duration?: number;
  confidence?: number;
}

export interface EvaluationScore {
  engagement_score: number;
  concept_coverage_score: number;
  clarity_score: number;
  overall_score: number;
}

export interface EvaluateResponse {
  scores: EvaluationScore;
  summary: string;
  recommendations: string[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    permissions: string[];
  };
  expires_in: number;
}

export interface AWSStatus {
  aws_region: string;
  services: Record<string, {
    status: string;
    ready_for_production: boolean;
    description: string;
  }>;
  security: Record<string, string>;
}

export const uploadVideo = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/upload/video', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

export const transcribeVideo = async (videoPath: string): Promise<TranscribeResponse> => {
  const response = await api.post('/transcribe', {
    video_path: videoPath,
  });
  
  return response.data;
};

export const evaluateTeaching = async (
  transcribedText: string,
  syllabusText: string,
  teachingObjectives?: string
): Promise<EvaluateResponse> => {
  const response = await api.post('/evaluate', {
    transcribed_text: transcribedText,
    syllabus_text: syllabusText,
    teaching_objectives: teachingObjectives,
  });
  
  return response.data;
};

export const healthCheck = async (): Promise<{ status: string; message: string }> => {
  const response = await api.get('/health');
  return response.data;
};

export const getAWSStatus = async (): Promise<AWSStatus> => {
  const response = await api.get('/aws-status');
  return response.data;
};

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.access_token) {
    localStorage.setItem('mentora_token', response.data.access_token);
    localStorage.setItem('mentora_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const register = async (
  email: string, 
  password: string, 
  name: string,
  role?: string
): Promise<AuthResponse> => {
  const response = await api.post('/auth/register', { 
    email, 
    password, 
    name,
    role: role || 'evaluator'
  });
  if (response.data.access_token) {
    localStorage.setItem('mentora_token', response.data.access_token);
    localStorage.setItem('mentora_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const getDemoToken = async (): Promise<AuthResponse> => {
  const response = await api.post('/auth/demo-token');
  if (response.data.access_token) {
    localStorage.setItem('mentora_token', response.data.access_token);
    localStorage.setItem('mentora_user', JSON.stringify(response.data.user));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('mentora_token');
  localStorage.removeItem('mentora_user');
};

export const getCurrentUser = () => {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('mentora_user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const isAuthenticated = () => {
  if (typeof window !== 'undefined') {
    return !!localStorage.getItem('mentora_token');
  }
  return false;
};

export const apiService = {
  uploadVideo,
  transcribeVideo,
  evaluateTeaching,
  healthCheck,
  getAWSStatus,
  login,
  register,
  getDemoToken,
  logout,
  getCurrentUser,
  isAuthenticated
};
