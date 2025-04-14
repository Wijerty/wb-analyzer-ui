import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import HomePage from './pages/HomePage';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HomePage />
    </ThemeProvider>
  );
}

export default App;