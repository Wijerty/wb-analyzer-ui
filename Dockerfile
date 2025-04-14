FROM node:16-alpine as build-frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY public/ ./public/
COPY src/ ./src/
COPY tsconfig.json tailwind.config.js postcss.config.js ./
RUN npm run build

FROM python:3.8-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml/ ./ml/
COPY server.py .

COPY --from=build-frontend /app/build ./build

RUN mkdir -p models uploads/videos uploads/images api_results

ENV FLASK_APP=server.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

EXPOSE 5000

CMD ["python", "server.py"] 
