import React, { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Typography, 
  Chip, 
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
  Box,
  Card,
  CardContent
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CancelIcon from '@mui/icons-material/Cancel';
import apiService, { AnalysisResult } from '../services/api';

interface AnalysisListProps {
  onViewAnalysis: (analysisId: string) => void;
}

const AnalysisList: React.FC<AnalysisListProps> = ({ onViewAnalysis }) => {
  const [analyses, setAnalyses] = useState<AnalysisResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalyses = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAnalyses();
      const sortedData = [...data].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      setAnalyses(sortedData);
      setError('');
    } catch (err) {
      console.error('Error fetching analyses:', err);
      setError('Не удалось загрузить список анализов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyses();
    
    const interval = setInterval(() => {
      fetchAnalyses();
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const handleCancelAnalysis = async (id: string) => {
    try {
      await apiService.cancelAnalysis(id);
      // Обновляем список после отмены
      fetchAnalyses();
    } catch (err) {
      console.error('Error cancelling analysis:', err);
      setError('Не удалось отменить анализ');
    }
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'pending':
        return <Chip label="Ожидает" color="default" size="small" />;
      case 'processing':
        return <Chip label="В процессе" color="primary" size="small" />;
      case 'completed':
        return <Chip label="Завершен" color="success" size="small" />;
      case 'failed':
        return <Chip label="Ошибка" color="error" size="small" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">История анализов</Typography>
          <Button variant="outlined" onClick={fetchAnalyses}>Обновить</Button>
        </Box>
        
        {loading && <LinearProgress />}
        
        {error && (
          <Typography color="error" sx={{ my: 2 }}>
            {error}
          </Typography>
        )}
        
        {analyses.length === 0 && !loading ? (
          <Typography sx={{ my: 3, textAlign: 'center' }}>
            Анализов пока нет. Создайте новый анализ для начала работы.
          </Typography>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Создан</TableCell>
                  <TableCell>Завершен</TableCell>
                  <TableCell>Товаров</TableCell>
                  <TableCell>Совпадений</TableCell>
                  <TableCell align="right">Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {analyses.map((analysis) => (
                  <TableRow key={analysis.id} hover>
                    <TableCell component="th" scope="row">
                      {analysis.id.substring(0, 8)}...
                    </TableCell>
                    <TableCell>{getStatusChip(analysis.status)}</TableCell>
                    <TableCell>{formatDate(analysis.createdAt)}</TableCell>
                    <TableCell>
                      {analysis.completedAt ? formatDate(analysis.completedAt) : '—'}
                    </TableCell>
                    <TableCell>{analysis.products.length}</TableCell>
                    <TableCell>{analysis.matches.length}</TableCell>
                    <TableCell align="right">
                      {analysis.status === 'pending' || analysis.status === 'processing' ? (
                        <Tooltip title="Отменить анализ">
                          <IconButton 
                            color="error" 
                            onClick={() => handleCancelAnalysis(analysis.id)}
                          >
                            <CancelIcon />
                          </IconButton>
                        </Tooltip>
                      ) : null}
                      
                      <Tooltip title="Просмотреть результаты">
                        <IconButton 
                          color="primary" 
                          onClick={() => onViewAnalysis(analysis.id)}
                          disabled={analysis.status !== 'completed'}
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalysisList;
