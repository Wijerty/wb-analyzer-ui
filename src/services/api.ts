import axios from 'axios';

// Базовый URL для API
const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:5000/api';

// Определение типов для ответов API
export interface ProductResult {
  id: string;
  productName: string;
  productImageUrls: string[];
  chartUrl: string;
  detected: boolean;
  matchCount: number;
  maxSimilarity: number;
  avgSimilarity: number;
  error?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  videoFileName: string;
  videoUrl: string;
  videoDuration: number;
  threshold: number;
  sampleRate: number;
  products: ProductResult[];
}

export interface AnalysisResultSummary {
  id: string;
  timestamp: string;
  videoFileName: string;
  productCount: number;
  detectedCount: number;
}

export interface SystemInfo {
  python_version: string;
  cuda_available: boolean;
  device_count: number;
  device_name: string;
  platform: string;
  model_path: string;
  model_exists: boolean;
  model_size: number;
  opencv_version: string;
  torch_version: string;
  api_version: string;
  app_name: string;
}

export interface ModelInfo {
  available: boolean;
  message: string;
  size?: number;
  error?: string;
}

// Функция для анализа видео
export const analyzeVideo = async (
  videoFile: File,
  productImages: { [key: string]: File[] },
  threshold: number = 0.85,
  sampleRate: number = 10
): Promise<{ analysisId: string }> => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('threshold', threshold.toString());
  formData.append('sample_rate', sampleRate.toString());
  
  // Добавляем все изображения товаров
  Object.keys(productImages).forEach((productId) => {
    const images = productImages[productId];
    images.forEach((image, index) => {
      formData.append(`product_image_${productId}_${index}`, image);
    });
  });
  
  try {
    const response = await axios.post(`${API_URL}/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при отправке запроса на анализ:', error);
    throw error;
  }
};

// Функция для получения результатов анализа
export const getAnalysisResult = async (analysisId: string): Promise<AnalysisResult> => {
  try {
    const response = await axios.get(`${API_URL}/results/${analysisId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении результатов анализа ${analysisId}:`, error);
    throw error;
  }
};

// Функция для получения списка всех анализов
export const getAllAnalysisResults = async (): Promise<AnalysisResultSummary[]> => {
  try {
    const response = await axios.get(`${API_URL}/results`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении списка анализов:', error);
    throw error;
  }
};

// Функция для отмены анализа
export const cancelAnalysis = async (analysisId: string): Promise<void> => {
  try {
    await axios.post(`${API_URL}/cancel-analysis/${analysisId}`);
  } catch (error) {
    console.error(`Ошибка при отмене анализа ${analysisId}:`, error);
    throw error;
  }
};

// Функция для проверки наличия модели
export const checkModelAvailability = async (): Promise<ModelInfo> => {
  try {
    const response = await axios.get(`${API_URL}/is-model-available`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при проверке наличия модели:', error);
    return {
      available: false,
      message: 'Ошибка при проверке наличия модели',
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

// Функция для получения информации о системе
export const getSystemInfo = async (): Promise<SystemInfo> => {
  try {
    const response = await axios.get(`${API_URL}/system-info`);
    return response.data;
  } catch (error) {
    console.error('Ошибка при получении информации о системе:', error);
    throw error;
  }
};

// Вспомогательная функция для загрузки временного изображения
export const uploadTempImage = async (imageFile: File): Promise<{ tempId: string, imageUrl: string }> => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  try {
    const response = await axios.post(`${API_URL}/upload-temp-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при загрузке временного изображения:', error);
    throw error;
  }
};

// Вспомогательная функция для проверки загрузки без анализа
export const testAnalyzeUpload = async (
  videoFile: File,
  productImages: { [key: string]: File[] },
  threshold: number = 0.85,
  sampleRate: number = 10
): Promise<any> => {
  const formData = new FormData();
  formData.append('video', videoFile);
  formData.append('threshold', threshold.toString());
  formData.append('sample_rate', sampleRate.toString());
  
  // Добавляем все изображения товаров
  Object.keys(productImages).forEach((productId) => {
    const images = productImages[productId];
    images.forEach((image, index) => {
      formData.append(`product_image_${productId}_${index}`, image);
    });
  });
  
  try {
    const response = await axios.post(`${API_URL}/analyze-test`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Ошибка при тестовой загрузке файлов:', error);
    throw error;
  }
};