import axios from 'axios';

// API URL из переменной окружения или по умолчанию
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Типы данных для работы с API
export interface MatchResult {
  timestamp: number;
  productId: string;
  similarity: number;
}

export interface ProductResult {
  id: string;
  name: string;
  imageUrl?: string;
  url?: string;
}

export interface AnalysisResult {
  id: string;
  videoUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  errorMessage?: string;
  matches: MatchResult[];
  products: ProductResult[];
  timeline: number[];
  threshold: number;
}

export interface AnalysisRequest {
  videoUrl: string;
  productIds: string[];
  threshold?: number;
}

// API методы
const apiService = {
  // Получить список всех анализов
  getAnalyses: async (): Promise<AnalysisResult[]> => {
    const response = await api.get('/analyses');
    return response.data;
  },

  // Получить конкретный анализ по ID
  getAnalysis: async (id: string): Promise<AnalysisResult> => {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  },

  // Создать новый анализ
  createAnalysis: async (data: AnalysisRequest): Promise<AnalysisResult> => {
    const response = await api.post('/analyses', data);
    return response.data;
  },

  // Загрузить видео и создать анализ
  uploadVideoAndAnalyze: async (videoFile: File, productIds: string[], threshold?: number): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('productIds', JSON.stringify(productIds));
    
    if (threshold) {
      formData.append('threshold', threshold.toString());
    }

    const response = await api.post('/analyses/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Отменить анализ
  cancelAnalysis: async (id: string): Promise<void> => {
    await api.post(`/analyses/${id}/cancel`);
  },

  // Поиск товаров на Wildberries
  searchProducts: async (query: string): Promise<ProductResult[]> => {
    const response = await api.get('/products/search', {
      params: { query }
    });
    return response.data;
  },

  // Получить конкретный товар по ID
  getProduct: async (id: string): Promise<ProductResult> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Получить несколько товаров по ID
  getProductsByIds: async (ids: string[]): Promise<ProductResult[]> => {
    const response = await api.post('/products/batch', { ids });
    return response.data;
  }
};

export default apiService;