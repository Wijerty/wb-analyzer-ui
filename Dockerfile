# Используем многоэтапную сборку

# Stage 1: Сборка React-приложения
FROM node:16-alpine as build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json tailwind.config.js postcss.config.js ./
RUN npm run build

# Stage 2: Настройка Python-приложения
FROM python:3.8-slim

# Установка необходимых системных зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копирование и установка зависимостей Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копирование файлов ML
COPY ml/ ./ml/
COPY server.py .

# Копирование собранного фронтенда
COPY --from=build-frontend /app/build ./build

# Создание необходимых директорий
RUN mkdir -p models uploads/videos uploads/images api_results

# Настройка переменных окружения
ENV FLASK_APP=server.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Открытие порта
EXPOSE 5000

# Запуск приложения
CMD ["python", "server.py"] 