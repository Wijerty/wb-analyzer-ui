module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        'wb-purple': '#cb11ab', // Основной цвет Wildberries
        'wb-purple-dark': '#a80d8e', // Темный оттенок основного цвета
        'wb-purple-light': '#e030c3', // Светлый оттенок основного цвета
        'wb-gray': '#f6f6f6', // Фоновый цвет Wildberries
        'wb-text': '#333333', // Цвет текста Wildberries
        'wb-success': '#2aad27', // Зеленый цвет для успешных действий
        'wb-warning': '#ffa900', // Желтый цвет для предупреждений
        'wb-error': '#ff3347', // Красный цвет для ошибок
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        'wb': '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
};