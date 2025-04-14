import axios from 'axios';

// API URL из переменных окружения или по умолчанию
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// HTTP клиент
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы данных API

export interface AvailabilityResponse {
  available: boolean;
  message?: string;
}

export interface AnalysisRequest {
  video: File;
  products: File[];
  threshold: number;
  sampleRate: number;
}

export interface AnalysisResponse {
  id: string;
  status: 'created' | 'processing';
  message?: string;
}

export interface TimelinePoint {
  timestamp: number;
  similarity: number;
}

export interface MatchResult {
  timestamp: number;
  similarity: number;
  imageUrl: string;
}

export interface ProductResult {
  productImageUrl: string;
  totalMatches: number;
  timeline: TimelinePoint[];
  matches: MatchResult[];
}

export interface AnalysisResult {
  id: string;
  status: 'processing' | 'completed' | 'failed' | 'canceled';
  progress?: number;
  videoDuration?: number;
  threshold?: number;
  sampleRate?: number;
  errorMessage?: string;
  products?: ProductResult[];
}

// API функции

/**
 * Проверка доступности модели для анализа
 */
export const checkModelAvailability = async (): Promise<AvailabilityResponse> => {
  try {
    const response = await apiClient.get('/model/status');
    return response.data;
  } catch (error) {
    console.error('Error checking model availability:', error);
    return {
      available: false,
      message: 'Не удалось проверить доступность модели',
    };
  }
};

/**
 * Отправка запроса на анализ видео
 */
export const submitVideoAnalysis = async (data: AnalysisRequest): Promise<AnalysisResponse> => {
  const formData = new FormData();
  formData.append('video', data.video);
  
  data.products.forEach((product, index) => {
    formData.append('products', product);
  });
  
  formData.append('threshold', data.threshold.toString());
  formData.append('sampleRate', data.sampleRate.toString());
  
  const response = await apiClient.post('/analysis', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return response.data;
};

/**
 * Получение результатов анализа
 */
export const getAnalysisResult = async (id: string): Promise<AnalysisResult> => {
  const response = await apiClient.get(`/analysis/${id}/result`);
  return response.data;
};

/**
 * Отмена анализа
 */
export const cancelAnalysis = async (id: string): Promise<void> => {
  await apiClient.post(`/analysis/${id}/cancel`);
};

/**
 * Получение списка всех анализов
 */
export const getAnalysisList = async (): Promise<AnalysisResult[]> => {
  const response = await apiClient.get('/analysis');
  return response.data;
};

export default {
  checkModelAvailability,
  submitVideoAnalysis,
  getAnalysisResult,
  cancelAnalysis,
  getAnalysisList,
};