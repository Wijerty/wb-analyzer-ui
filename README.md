# WB Analyzer UI

Веб-интерфейс для анализа товаров Wildberries в видео.

## Возможности

- Загрузка видео для анализа
- Использование видео по URL
- Поиск и выбор товаров Wildberries для анализа
- Визуализация результатов анализа с таймлайном и статистикой
- Управление историей анализов

## Технологии

- React 18
- TypeScript
- Material UI
- Axios

## Установка

1. Клонировать репозиторий:
```
git clone https://github.com/Wijerty/wb-analyzer-ui.git
cd wb-analyzer-ui
```

2. Установить зависимости:
```
npm install
```

3. Настроить переменные окружения (опционально):
Создайте файл `.env` в корне проекта:
```
REACT_APP_API_URL=http://your-api-server:8000/api
```

4. Запустить разработческий сервер:
```
npm start
```

## Сборка для продакшена

```
npm run build
```

## Структура проекта

- `src/components` - React компоненты
- `src/pages` - Страницы приложения
- `src/services` - API сервисы для взаимодействия с бэкендом

## API Интеграция

Приложение взаимодействует с бэкенд-сервером через API. Основные точки интеграции:

- `GET /api/analyses` - получение списка анализов
- `GET /api/analyses/:id` - получение данных конкретного анализа
- `POST /api/analyses` - создание нового анализа по URL видео
- `POST /api/analyses/upload` - загрузка видео и создание анализа
- `POST /api/analyses/:id/cancel` - отмена анализа
- `GET /api/products/search` - поиск товаров Wildberries
- `GET /api/products/:id` - получение информации о товаре
- `POST /api/products/batch` - получение информации о нескольких товарах

## Лицензия

MIT