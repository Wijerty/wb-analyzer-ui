#!/bin/bash
# Скрипт для установки всех зависимостей проекта

# Цветовые коды для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=== Установка зависимостей для WB Анализатор видео ===${NC}"

# Проверка наличия Python
if command -v python3 &>/dev/null; then
    echo -e "${GREEN}Python установлен${NC}"
    PYTHON_CMD=python3
elif command -v python &>/dev/null; then
    echo -e "${GREEN}Python установлен${NC}"
    PYTHON_CMD=python
else
    echo -e "${RED}Ошибка: Python не найден. Пожалуйста, установите Python 3.8 или выше${NC}"
    exit 1
fi

# Создание виртуального окружения Python
echo -e "${BLUE}Создание виртуального окружения Python...${NC}"
$PYTHON_CMD -m venv venv

# Активация виртуального окружения
echo -e "${BLUE}Активация виртуального окружения...${NC}"
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Установка зависимостей Python
echo -e "${BLUE}Установка зависимостей Python...${NC}"
pip install --upgrade pip
pip install -r requirements.txt

# Проверка наличия npm
if command -v npm &>/dev/null; then
    echo -e "${GREEN}npm установлен${NC}"
else
    echo -e "${RED}Ошибка: npm не найден. Пожалуйста, установите Node.js${NC}"
    exit 1
fi

# Установка зависимостей npm
echo -e "${BLUE}Установка зависимостей Node.js...${NC}"
npm install

# Создание директорий для моделей и данных
echo -e "${BLUE}Создание директорий...${NC}"
mkdir -p models uploads uploads/videos uploads/images api_results

echo -e "${GREEN}=== Установка завершена! ===${NC}"
echo -e "Для запуска фронтенда: ${BLUE}npm start${NC}"
echo -e "Для запуска бэкенда: ${BLUE}source venv/bin/activate && python server.py${NC}${NC}"
echo -e "Примечание: Необходимо поместить файл модели в директорию ${BLUE}models/ssl_model_epoch_80.pth${NC}" 