import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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

export const apiService = {
  // Upload video file
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

  // Transcribe video
  transcribeVideo: async (videoPath: string): Promise<TranscribeResponse> => {
    const response = await api.post('/transcribe', {
      video_path: videoPath,
    });
    
    return response.data;
  },

  // Evaluate teaching
  evaluateTeaching: async (
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
  },

  // Health check
  healthCheck: async (): Promise<{ status: string; message: string }> => {
    const response = await api.get('/health');
    return response.data;
  },
};