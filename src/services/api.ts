import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

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

const apiService = {
  getAnalyses: async (): Promise<AnalysisResult[]> => {
    const response = await api.get('/analyses');
    return response.data;
  },

  getAnalysis: async (id: string): Promise<AnalysisResult> => {
    const response = await api.get(`/analyses/${id}`);
    return response.data;
  },

  createAnalysis: async (data: AnalysisRequest): Promise<AnalysisResult> => {
    const response = await api.post('/analyses', data);
    return response.data;
  },

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

  cancelAnalysis: async (id: string): Promise<void> => {
    await api.post(`/analyses/${id}/cancel`);
  },

  searchProducts: async (query: string): Promise<ProductResult[]> => {
    const response = await api.get('/products/search', {
      params: { query }
    });
    return response.data;
  },

  getProduct: async (id: string): Promise<ProductResult> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getProductsByIds: async (ids: string[]): Promise<ProductResult[]> => {
    const response = await api.post('/products/batch', { ids });
    return response.data;
  }
};

export default apiService;
