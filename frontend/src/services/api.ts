import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface UploadResponse {
  video_id: string;
  filename: string;
  s3_url: string;
  file_size: number;
  message: string;
}

export interface EvaluationScore {
  engagement_score: number;
  clarity_score: number;
  concept_coverage_score: number;
  pedagogy_score: number;
  overall_score: number;
}

export interface EvaluateResponse {
  evaluation_id: string;
  scores: EvaluationScore;
  summary: string;
  recommendations: string[];
  video_filename: string;
  evaluated_at: string;
}

export interface Evaluation {
  id: string;
  video_id: string;
  scores: EvaluationScore;
  summary: string;
  recommendations: string[];
  evaluated_at: string;
  videos: {
    filename: string;
    uploaded_at: string;
  };
}

export const apiService = {
  // Authentication
  demoLogin: async (): Promise<LoginResponse> => {
    const response = await api.post('/auth/demo-login');
    const { access_token } = response.data;
    localStorage.setItem('auth_token', access_token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('auth_token');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('auth_token');
  },

  // Video upload
  uploadVideo: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post('/upload/video', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Teaching evaluation
  evaluateTeaching: async (
    videoId: string,
    syllabusText: string
  ): Promise<EvaluateResponse> => {
    const response = await api.post('/evaluate', {
      video_id: videoId,
      syllabus_text: syllabusText,
    });
    
    return response.data;
  },

  // Get evaluations history
  getEvaluations: async (): Promise<{ evaluations: Evaluation[]; count: number }> => {
    const response = await api.get('/evaluations');
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<{ 
    status: string; 
    message: string; 
    aws_s3_enabled: boolean;
    database_enabled: boolean;
  }> => {
    const response = await api.get('/health');
    return response.data;
  },
};