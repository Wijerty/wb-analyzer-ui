import React from 'react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  return (
    <div>
      {/* Главный баннер */}
      <section className="wb-gradient-bg py-20 md:py-32 text-white">
        <div className="wb-container">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Анализ наличия товаров на видео с помощью ИИ
            </h1>
            <p className="text-lg mb-8">
              Загрузите фото товара и видео, чтобы узнать, присутствует ли данный товар в видеоролике
            </p>
            <Link 
              to="/analyze" 
              className="wb-button bg-white text-wb-purple hover:bg-gray-100 px-8 py-3 rounded-md inline-flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Начать анализ
            </Link>
          </div>
        </div>
      </section>

      {/* Как это работает */}
      <section className="py-20 bg-white">
        <div className="wb-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-wb-text mb-4">Как это работает</h2>
            <p className="text-lg text-wb-text max-w-2xl mx-auto">
              Процесс анализа видео простой и эффективный
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="wb-card flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-wb-purple flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wb-text mb-2">1. Загрузите изображения товаров</h3>
              <p className="text-wb-text">
                Загрузите одно или несколько изображений товаров, которые вы хотите найти на видео
              </p>
            </div>

            <div className="wb-card flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-wb-purple flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wb-text mb-2">2. Загрузите видео</h3>
              <p className="text-wb-text">
                Загрузите видеоролик, в котором система будет искать указанные товары
              </p>
            </div>

            <div className="wb-card flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-wb-purple flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-wb-text mb-2">3. Получите результаты</h3>
              <p className="text-wb-text">
                Система проанализирует видео и предоставит подробный отчет о наличии товаров
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Преимущества */}
      <section className="py-20 bg-wb-gray">
        <div className="wb-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-wb-text mb-4">Преимущества нашей системы</h2>
            <p className="text-lg text-wb-text max-w-2xl mx-auto">
              Почему наша технология лучшая для поиска товаров на видео
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-wb-purple flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-wb-text mb-2">Мощный искусственный интеллект</h3>
                <p className="text-wb-text">
                  Наша система использует современные алгоритмы самоконтролируемого обучения для эффективного распознавания объектов на видео
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-wb-purple flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11zm8.921 2.012a1 1 0 01.831 1.145 19.86 19.86 0 01-.545 2.436 1 1 0 11-1.92-.558c.207-.713.371-1.445.49-2.192a1 1 0 011.144-.83z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-wb-text mb-2">Быстрый анализ</h3>
                <p className="text-wb-text">
                  Обработка видео происходит максимально быстро благодаря оптимизированному коду и использованию GPU ускорения
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-wb-purple flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-wb-text mb-2">Простота использования</h3>
                <p className="text-wb-text">
                  Интуитивно понятный интерфейс позволяет легко загружать файлы и получать результаты анализа без специальных навыков
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mr-4">
                <div className="w-12 h-12 rounded-full bg-wb-purple flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold text-wb-text mb-2">Детальная визуализация</h3>
                <p className="text-wb-text">
                  Получайте наглядные графики и отчеты, позволяющие понять, где именно в видео появляется товар
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Призыв к действию */}
      <section className="wb-gradient-bg py-16 text-white text-center">
        <div className="wb-container">
          <h2 className="text-3xl font-bold mb-6">Готовы проанализировать видео?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Начните использовать нашу систему анализа видео прямо сейчас
          </p>
          <Link 
            to="/analyze" 
            className="bg-white text-wb-purple hover:bg-gray-100 px-8 py-3 rounded-md inline-flex items-center font-medium"
          >
            Начать анализ
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;