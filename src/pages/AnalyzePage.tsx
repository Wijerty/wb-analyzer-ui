import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import LoadingIndicator from '../components/LoadingIndicator';
import { analyzeVideo, checkModelAvailability } from '../services/api';

interface ProductImage {
  id: number;
  files: File[];
}

const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [products, setProducts] = useState<ProductImage[]>([
    { id: 0, files: [] }
  ]);
  const [threshold, setThreshold] = useState<number>(0.85);
  const [sampleRate, setSampleRate] = useState<number>(10);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [modelAvailable, setModelAvailable] = useState<boolean>(true);
  const [modelMessage, setModelMessage] = useState<string | null>(null);

  // Проверка наличия модели при загрузке страницы
  useEffect(() => {
    const checkModel = async () => {
      try {
        const modelInfo = await checkModelAvailability();
        setModelAvailable(modelInfo.available);
        if (!modelInfo.available) {
          setModelMessage(modelInfo.message);
        }
      } catch (error) {
        console.error('Ошибка при проверке наличия модели:', error);
        setModelAvailable(false);
        setModelMessage('Не удалось проверить наличие модели');
      }
    };

    checkModel();
  }, []);

  const handleVideoSelect = (files: File[]) => {
    if (files.length > 0) {
      setVideoFile(files[0]);
    }
  };

  const handleProductImageSelect = (productId: number) => (files: File[]) => {
    setProducts(prevProducts => 
      prevProducts.map(product => 
        product.id === productId ? { ...product, files: [...product.files, ...files] } : product
      )
    );
  };

  const handleRemoveProductImage = (productId: number, index: number) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          const newFiles = [...product.files];
          newFiles.splice(index, 1);
          return { ...product, files: newFiles };
        }
        return product;
      })
    );
  };

  const addProduct = () => {
    const newId = Math.max(...products.map(p => p.id), 0) + 1;
    setProducts([...products, { id: newId, files: [] }]);
  };

  const removeProduct = (productId: number) => {
    if (products.length > 1) {
      setProducts(products.filter(product => product.id !== productId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Проверки
    if (!videoFile) {
      setError('Пожалуйста, загрузите видео для анализа');
      return;
    }

    // Проверка, что все товары имеют хотя бы одно изображение
    const emptyProducts = products.filter(product => product.files.length === 0);
    if (emptyProducts.length > 0) {
      setError(`Пожалуйста, загрузите изображения для товара ${emptyProducts[0].id + 1}`);
      return;
    }

    try {
      setIsAnalyzing(true);

      // Преобразование массива продуктов в требуемый формат
      const productImagesMap: { [key: string]: File[] } = {};
      products.forEach(product => {
        productImagesMap[product.id] = product.files;
      });

      // Отправка запроса на анализ
      const result = await analyzeVideo(videoFile, productImagesMap, threshold, sampleRate);
      
      // Переход на страницу результатов
      navigate(`/results/${result.analysisId}`);
    } catch (error) {
      console.error('Ошибка при анализе:', error);
      if (error instanceof Error) {
        setError(`Ошибка при анализе: ${error.message}`);
      } else {
        setError('Произошла неизвестная ошибка при анализе');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="py-10 bg-wb-gray min-h-screen">
      <div className="wb-container">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-wb-text">Анализ видео</h1>
          <p className="mt-3 text-lg text-wb-text max-w-2xl mx-auto">
            Загрузите видео и изображения товаров для анализа
          </p>
        </div>

        {!modelAvailable && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Модель не найдена</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{modelMessage || 'Файл модели отсутствует или поврежден. Пожалуйста, убедитесь, что модель корректно установлена.'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <form onSubmit={handleSubmit}>
            {/* Видео */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-wb-text mb-4">Загрузка видео</h2>
              <FileUpload
                accept=".mp4,.avi,.mov,.webm"
                onFileSelect={handleVideoSelect}
                fileType="video"
                label="Выберите видео для анализа"
                isUploading={isAnalyzing}
              />
            </div>

            {/* Товары */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-wb-text">Изображения товаров</h2>
                <button
                  type="button"
                  onClick={addProduct}
                  className="text-wb-purple hover:text-wb-purple-dark flex items-center"
                  disabled={isAnalyzing}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Добавить товар
                </button>
              </div>

              <div className="space-y-6">
                {products.map((product, index) => (
                  <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium text-wb-text">Товар {product.id + 1}</h3>
                      {products.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeProduct(product.id)}
                          className="text-gray-500 hover:text-red-500"
                          disabled={isAnalyzing}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      )}
                    </div>

                    <FileUpload
                      accept=".jpg,.jpeg,.png,.webp"
                      onFileSelect={handleProductImageSelect(product.id)}
                      fileType="image"
                      multiple={true}
                      label="Загрузите фото товара"
                      isUploading={isAnalyzing}
                    />

                    {/* Предварительный просмотр загруженных изображений */}
                    {product.files.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-wb-text mb-2">Загруженные изображения ({product.files.length})</h4>
                        <div className="flex flex-wrap -mx-1">
                          {product.files.map((file, fileIndex) => (
                            <div key={fileIndex} className="p-1 w-16 h-16 relative">
                              <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${fileIndex}`}
                                className="w-full h-full object-cover rounded"
                              />
                              <button
                                type="button"
                                className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                                onClick={() => handleRemoveProductImage(product.id, fileIndex)}
                                disabled={isAnalyzing}
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Параметры анализа */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-wb-text mb-4">Параметры анализа</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-wb-text mb-1">
                    Порог сходства ({threshold})
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="0.95"
                    step="0.01"
                    value={threshold}
                    onChange={(e) => setThreshold(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isAnalyzing}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5 (Низкий)</span>
                    <span>0.95 (Высокий)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-wb-text mb-1">
                    Частота выборки кадров ({sampleRate})
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={sampleRate}
                    onChange={(e) => setSampleRate(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    disabled={isAnalyzing}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1 (Высокая)</span>
                    <span>30 (Низкая)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Ошибка */}
            {error && (
              <div className="mb-6 text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}

            {/* Кнопка отправки */}
            <div className="flex justify-center">
              <button
                type="submit"
                className={`wb-button px-8 py-3 text-lg ${isAnalyzing || !modelAvailable ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isAnalyzing || !modelAvailable}
              >
                {isAnalyzing ? 'Анализ...' : 'Начать анализ'}
              </button>
            </div>
          </form>
        </div>

        {/* Индикатор загрузки */}
        {isAnalyzing && (
          <div className="mt-8">
            <LoadingIndicator message="Идет анализ видео..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyzePage;