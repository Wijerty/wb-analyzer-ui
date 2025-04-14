import React from 'react';
import { Link } from 'react-router-dom';

const AboutPage: React.FC = () => {
  return (
    <div>
      <section className="wb-gradient-bg py-16 md:py-24 text-white">
        <div className="wb-container">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">О проекте</h1>
          <p className="text-lg max-w-3xl mx-auto text-center">
            WB Анализатор видео - это инструмент для обнаружения объектов на видео с помощью технологии искусственного интеллекта
          </p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="wb-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-wb-text mb-6">Что такое WB Анализатор?</h2>
            <p className="text-lg mb-6 text-wb-text">
              WB Анализатор - это инструмент, который использует современные технологии компьютерного зрения 
              для поиска товаров на видео по их фотографиям. Наш анализатор разработан специально для обнаружения
              объектов без необходимости предварительной разметки данных.
            </p>
            <p className="text-lg mb-10 text-wb-text">
              Вместо традиционных методов, требующих обучения на больших размеченных датасетах, наша система 
              использует подход самоконтролируемого обучения (Self-Supervised Learning), который позволяет модели
              учиться распознавать и находить объекты, имея только их изображения.
            </p>

            <h2 className="text-3xl font-bold text-wb-text mb-6">Технология</h2>
            <div className="mb-10">
              <h3 className="text-xl font-bold text-wb-text mb-4">Самоконтролируемое обучение (SSL)</h3>
              <p className="text-lg mb-4 text-wb-text">
                В основе системы лежит технология самоконтролируемого обучения, которая позволяет модели учиться на 
                неразмеченных данных. Принцип работы:
              </p>
              <ul className="list-disc pl-6 mb-6 text-lg text-wb-text space-y-2">
                <li>Создание различных представлений одного и того же изображения с помощью случайных преобразований</li>
                <li>Контрастивное обучение: модель учится приближать представления одного и того же изображения и отдалять представления разных изображений</li>
                <li>Формирование высокоуровневых представлений объектов, выделяя их ключевые характеристики</li>
              </ul>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-wb-text mb-4">Архитектура модели</h3>
              <ul className="list-disc pl-6 mb-6 text-lg text-wb-text space-y-2">
                <li>Базовая сеть: ResNet50, извлекающая признаки из изображений</li>
                <li>Проекционная голова: преобразует 2048-мерные признаки в более компактное 128-мерное представление</li>
                <li>Функция потерь: NT-Xent (Normalized Temperature-scaled Cross Entropy Loss)</li>
              </ul>
            </div>

            <div className="mb-10">
              <h3 className="text-xl font-bold text-wb-text mb-4">Процесс обнаружения объектов</h3>
              <ol className="list-decimal pl-6 mb-6 text-lg text-wb-text space-y-2">
                <li>Модель извлекает признаки из целевого изображения объекта</li>
                <li>Для каждого кадра видео извлекаются аналогичные признаки</li>
                <li>Вычисляется косинусное сходство между целевым объектом и кадром</li>
                <li>Если сходство выше порогового значения, объект считается найденным</li>
                <li>Результаты визуализируются в виде графиков и отчетов</li>
              </ol>
            </div>

            <h2 className="text-3xl font-bold text-wb-text mb-6">Преимущества подхода</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              <div className="wb-card">
                <h3 className="text-xl font-bold text-wb-text mb-3">Обучение без разметки</h3>
                <p className="text-wb-text">
                  Модель не требует большого количества размеченных данных для обучения, что существенно снижает трудозатраты
                </p>
              </div>
              
              <div className="wb-card">
                <h3 className="text-xl font-bold text-wb-text mb-3">Поиск по образцу</h3>
                <p className="text-wb-text">
                  Возможность найти любой объект на видео, имея только его изображение, без предварительного обучения на специфических классах
                </p>
              </div>
              
              <div className="wb-card">
                <h3 className="text-xl font-bold text-wb-text mb-3">Высокая точность</h3>
                <p className="text-wb-text">
                  Модель достигает значительной точности в обнаружении объектов благодаря эффективному обучению представлений
                </p>
              </div>
              
              <div className="wb-card">
                <h3 className="text-xl font-bold text-wb-text mb-3">Оптимизация для GPU</h3>
                <p className="text-wb-text">
                  Система оптимизирована для работы на графических процессорах NVIDIA CUDA, что обеспечивает высокую скорость обработки
                </p>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-wb-text mb-6">Применение</h2>
            <p className="text-lg mb-6 text-wb-text">
              WB Анализатор разработан для решения различных задач, включая:
            </p>
            <ul className="list-disc pl-6 mb-10 text-lg text-wb-text space-y-2">
              <li>Проверка наличия товаров на видеообзорах</li>
              <li>Поиск товаров в рекламных роликах</li>
              <li>Анализ видеоконтента для маркетинговых исследований</li>
              <li>Мониторинг появления продукции в медиа</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="wb-gradient-bg py-16 text-white text-center">
        <div className="wb-container">
          <h2 className="text-3xl font-bold mb-6">Попробуйте сами!</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Начните использовать WB Анализатор прямо сейчас и оцените эффективность нашей технологии
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

export default AboutPage;
