module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  darkMode: false, 
  theme: {
    extend: {
      colors: {
        'wb-purple': '#cb11ab', 
        'wb-purple-dark': '#a80d8e', 
        'wb-purple-light': '#e030c3', 
        'wb-gray': '#f6f6f6', 
        'wb-text': '#333333', 
        'wb-success': '#2aad27', 
        'wb-warning': '#ffa900', 
        'wb-error': '#ff3347',
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
