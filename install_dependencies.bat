@echo off
echo === Установка зависимостей для WB Анализатор видео ===

where python >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Ошибка: Python не найден. Пожалуйста, установите Python 3.8 или выше
    exit /b 1
)

echo Создание виртуального окружения Python...
python -m venv venv

echo Активация виртуального окружения...
call venv\Scripts\activate.bat

echo Установка зависимостей Python...
pip install --upgrade pip
pip install -r requirements.txt

where npm >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo Ошибка: npm не найден. Пожалуйста, установите Node.js
    exit /b 1
)

echo Установка зависимостей Node.js...
npm install

echo Создание директорий...
mkdir models 2>nul
mkdir uploads 2>nul
mkdir uploads\videos 2>nul
mkdir uploads\images 2>nul
mkdir api_results 2>nul

echo === Установка завершена! ===
echo Для запуска фронтенда: npm start
echo Для запуска бэкенда: call venv\Scripts\activate.bat ^&^& python server.py
echo Примечание: Необходимо поместить файл модели в директорию models\ssl_model_epoch_80.pth 
