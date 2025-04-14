import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Tabs, Tab, Typography, Paper } from '@mui/material';
import NewAnalysisForm from '../components/NewAnalysisForm';
import AnalysisList from '../components/AnalysisList';
import AnalysisResult from '../components/AnalysisResult';
import apiService, { AnalysisResult as AnalysisResultType } from '../services/api';

// Интерфейс для состояния табов
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Компонент для содержимого таба
function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Функция для генерации свойств aria-* для табов
function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const HomePage: React.FC = () => {
  // Состояние для табов
  const [tabValue, setTabValue] = useState(0);
  
  // Состояние для просмотра результатов анализа
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisResultType | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [analysisError, setAnalysisError] = useState('');

  // Обработчик смены табов
  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Функция для загрузки данных анализа по ID
  const fetchAnalysisDetails = async (id: string) => {
    try {
      setLoadingAnalysis(true);
      setAnalysisError('');
      
      const analysis = await apiService.getAnalysis(id);
      setSelectedAnalysis(analysis);
      
      // Переключаемся на вкладку с результатами
      setTabValue(2);
    } catch (err) {
      console.error('Error fetching analysis details:', err);
      setAnalysisError('Не удалось загрузить данные анализа');
      setSelectedAnalysis(null);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Обработчик события создания нового анализа
  const handleAnalysisCreated = (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    // Переключаемся на вкладку со списком
    setTabValue(1);
  };

  // Обработчик просмотра анализа из списка
  const handleViewAnalysis = (analysisId: string) => {
    setSelectedAnalysisId(analysisId);
    fetchAnalysisDetails(analysisId);
  };

  // Загружаем детали анализа при изменении selectedAnalysisId
  useEffect(() => {
    if (selectedAnalysisId) {
      fetchAnalysisDetails(selectedAnalysisId);
    }
  }, [selectedAnalysisId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Анализатор товаров в видео Wildberries
      </Typography>
      
      <Paper sx={{ mb: 4 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Новый анализ" {...a11yProps(0)} />
          <Tab label="История анализов" {...a11yProps(1)} />
          {selectedAnalysis && <Tab label="Результаты анализа" {...a11yProps(2)} />}
        </Tabs>
      </Paper>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <NewAnalysisForm onAnalysisCreated={handleAnalysisCreated} />
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <AnalysisList onViewAnalysis={handleViewAnalysis} />
          </Grid>
        </Grid>
      </TabPanel>
      
      <TabPanel value={tabValue} index={2}>
        {loadingAnalysis ? (
          <Typography>Загрузка данных анализа...</Typography>
        ) : analysisError ? (
          <Typography color="error">{analysisError}</Typography>
        ) : selectedAnalysis ? (
          <AnalysisResult analysis={selectedAnalysis} />
        ) : (
          <Typography>Выберите анализ для просмотра результатов</Typography>
        )}
      </TabPanel>
    </Container>
  );
};

export default HomePage;