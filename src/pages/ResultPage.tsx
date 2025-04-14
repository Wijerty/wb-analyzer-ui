import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAnalysisResult, cancelAnalysis, AnalysisResult, ProductResult } from '../services/api';
import LoadingIndicator from '../components/LoadingIndicator';

const ResultPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'gallery'>('timeline');
  const [isCanceling, setIsCanceling] = useState<boolean>(false);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        setLoading(true);
        const data = await getAnalysisResult(id);
        setResult(data);
        
        // Выбрать первый продукт по умолчанию, если есть результаты
        if (data.products && data.products.length > 0) {
          setSelectedProduct(0);
        }
      } catch (error) {
        console.error('Error fetching analysis result:', error);
        if (error instanceof Error) {
          setError(`Ошибка получения результатов: ${error.message}`);
        } else {
          setError('Не удалось получить результаты анализа');
        }
      } finally {
        setLoading(false);
      }
    };

    // Периодически проверять результаты, если анализ еще не завершен
    const intervalId = setInterval(() => {
      fetchResult();
    }, 3000);

    // Начальная загрузка
    fetchResult();

    // Очистка интервала при размонтировании
    return () => clearInterval(intervalId);
  }, [id]);

  const handleCancelAnalysis = async () => {
    if (!id) return;
    try {
      setIsCanceling(true);
      await cancelAnalysis(id);
      // Обновить данные после отмены
      const updatedResult = await getAnalysisResult(id);
      setResult(updatedResult);
    } catch (error) {
      console.error('Error canceling analysis:', error);
      if (error instanceof Error) {
        setError(`Ошибка при отмене анализа: ${error.message}`);
      } else {
        setError('Не удалось отменить анализ');
      }
    } finally {
      setIsCanceling(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(1) + '%';
  };

  const renderStatus = () => {
    if (!result) return null;

    if (result.status === 'completed') {
      return (
        <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Анализ успешно завершен
              </p>
            </div>
          </div>
        </div>
      );
    } else if (result.status === 'failed') {
      return (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">
                {result.errorMessage || 'Анализ завершился с ошибкой'}
              </p>
            </div>
          </div>
        </div>
      );
    } else if (result.status === 'canceled') {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.257 7.757a1 1 0 011.414-1.414L10 7.586l1.328-1.243a1 1 0 011.414 1.414L11.414 9l1.328 1.243a1 1 0 01-1.414 1.414L10 10.414l-1.328 1.243a1 1 0 01-1.414-1.414L8.586 9 7.257 7.757z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Анализ был отменен
              </p>
            </div>
          </div>
        </div>
      );
    } else {
      // Статус "processing"
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-800">
                  Выполняется анализ видео... {result.progress ? `(${Math.round(result.progress * 100)}%)` : ''}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelAnalysis}
              disabled={isCanceling}
              className="text-sm font-medium text-blue-800 hover:text-blue-600 focus:outline-none"
            >
              {isCanceling ? 'Отмена...' : 'Отменить анализ'}
            </button>
          </div>
        </div>
      );
    }
  };

  const renderTimeline = (product: ProductResult) => {
    if (!product.timeline || product.timeline.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          Нет данных для временной шкалы
        </div>
      );
    }

    // Найти максимальное сходство для нормализации высоты графика
    const maxSimilarity = Math.max(...product.timeline.map(item => item.similarity));

    return (
      <div className="mt-4">
        <div className="relative h-40">
          {/* Горизонтальные линии сетки */}
          <div className="absolute inset-0 border-b border-gray-200"></div>
          <div className="absolute inset-0 h-1/4 border-b border-gray-200"></div>
          <div className="absolute inset-0 h-2/4 border-b border-gray-200"></div>
          <div className="absolute inset-0 h-3/4 border-b border-gray-200"></div>

          {/* Метки процентов */}
          <div className="absolute left-0 top-0 -translate-y-1/2 text-xs text-gray-500">100%</div>
          <div className="absolute left-0 top-1/4 -translate-y-1/2 text-xs text-gray-500">75%</div>
          <div className="absolute left-0 top-2/4 -translate-y-1/2 text-xs text-gray-500">50%</div>
          <div className="absolute left-0 top-3/4 -translate-y-1/2 text-xs text-gray-500">25%</div>
          <div className="absolute left-0 bottom-0 -translate-y-1/2 text-xs text-gray-500">0%</div>

          {/* График */}
          <div className="absolute inset-0 flex items-end">
            {product.timeline.map((point, index) => {
              const normalizedHeight = (point.similarity / maxSimilarity) * 100;
              const barHeight = `${normalizedHeight}%`;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div 
                    className="w-1 bg-wb-purple hover:bg-wb-purple-dark cursor-pointer" 
                    style={{ height: barHeight }}
                    title={`${formatTime(point.timestamp)}: ${formatPercentage(point.similarity)}`}
                  ></div>
                  {/* Отображаем метку времени для каждой 10-й точки или если мало точек */}
                  {(index % 10 === 0 || product.timeline.length < 20) && (
                    <div className="text-xs text-gray-500 mt-1">{formatTime(point.timestamp)}</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderGallery = (product: ProductResult) => {
    if (!product.matches || product.matches.length === 0) {
      return (
        <div className="text-center text-gray-500 py-10">
          Совпадений не найдено
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {product.matches.map((match, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="aspect-w-16 aspect-h-9 relative">
              <img 
                src={match.imageUrl} 
                alt={`Match at ${formatTime(match.timestamp)}`} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-wb-text">Время: {formatTime(match.timestamp)}</div>
              <div className="text-sm text-gray-600">Сходство: {formatPercentage(match.similarity)}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <LoadingIndicator message="Загрузка результатов анализа..." />;
  }

  if (error) {
    return (
      <div className="wb-container py-10">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Ошибка</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
        <Link to="/analyze" className="wb-button inline-block">
          Вернуться к анализу
        </Link>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="wb-container py-10">
        <div className="text-center">
          <p className="text-lg text-wb-text">Результаты не найдены</p>
          <Link to="/analyze" className="wb-button inline-block mt-4">
            Вернуться к анализу
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-wb-gray min-h-screen">
      <div className="wb-container">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-wb-text">Результаты анализа</h1>
          <Link to="/analyze" className="wb-button-outline">
            Новый анализ
          </Link>
        </div>

        {/* Статус анализа */}
        {renderStatus()}

        {/* Информация о видео */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-wb-text mb-3">Информация о видео</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Длительность</p>
              <p className="text-lg text-wb-text">{formatTime(result.videoDuration || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Порог сходства</p>
              <p className="text-lg text-wb-text">{formatPercentage(result.threshold || 0)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Частота выборки</p>
              <p className="text-lg text-wb-text">{result.sampleRate || 0} кадров/сек</p>
            </div>
          </div>
        </div>

        {/* Нет результатов для отображения */}
        {(!result.products || result.products.length === 0) && (
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <p className="text-lg text-wb-text mb-4">
              {result.status === 'processing' 
                ? 'Анализ еще выполняется. Пожалуйста, подождите.' 
                : 'Нет данных для отображения.'}
            </p>
          </div>
        )}

        {/* Вкладки продуктов */}
        {result.products && result.products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Вкладки продуктов */}
            <div className="flex overflow-x-auto border-b border-gray-200">
              {result.products.map((product, index) => (
                <button
                  key={index}
                  className={`px-4 py-3 font-medium text-sm ${
                    selectedProduct === index
                      ? 'border-b-2 border-wb-purple text-wb-purple'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setSelectedProduct(index)}
                >
                  Товар {index + 1}
                  {product.totalMatches > 0 && (
                    <span className="ml-2 bg-wb-purple text-white px-1.5 py-0.5 rounded-full text-xs">
                      {product.totalMatches}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Содержимое выбранного продукта */}
            {selectedProduct !== null && (
              <div className="p-6">
                <div className="flex items-center mb-6">
                  <div className="w-20 h-20 rounded-lg overflow-hidden mr-4">
                    <img
                      src={result.products[selectedProduct].productImageUrl}
                      alt={`Товар ${selectedProduct + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-wb-text">Товар {selectedProduct + 1}</h3>
                    <p className="text-gray-600">
                      {result.products[selectedProduct].totalMatches > 0
                        ? `Найдено ${result.products[selectedProduct].totalMatches} совпадений`
                        : 'Совпадений не найдено'}
                    </p>
                  </div>
                </div>

                {/* Вкладки для просмотра */}
                <div className="border-b border-gray-200 mb-4">
                  <div className="flex">
                    <button
                      className={`pb-2 mr-4 text-sm font-medium ${
                        activeTab === 'timeline'
                          ? 'border-b-2 border-wb-purple text-wb-purple'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('timeline')}
                    >
                      Временная шкала
                    </button>
                    <button
                      className={`pb-2 mr-4 text-sm font-medium ${
                        activeTab === 'gallery'
                          ? 'border-b-2 border-wb-purple text-wb-purple'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                      onClick={() => setActiveTab('gallery')}
                    >
                      Галерея совпадений
                    </button>
                  </div>
                </div>

                {/* Содержимое активной вкладки */}
                {activeTab === 'timeline' ? (
                  renderTimeline(result.products[selectedProduct])
                ) : (
                  renderGallery(result.products[selectedProduct])
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;