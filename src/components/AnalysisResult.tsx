import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { AnalysisResult, ProductResult, MatchResult } from '../services/api';
import ResultTimeline from './ResultTimeline';

interface AnalysisResultProps {
  result: AnalysisResult;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement>;
}

const AnalysisResultComponent: React.FC<AnalysisResultProps> = ({
  result,
  onClose,
  videoRef,
}) => {
  const [selectedMatchIndex, setSelectedMatchIndex] = useState<number | null>(null);

  const totalMatches = result.matches.length;
  
  const matchedProducts = new Set(result.matches.map(m => m.productId)).size;
  
  const avgSimilarity = result.matches.reduce((sum, match) => sum + match.similarity, 0) / 
    (totalMatches || 1);
  
  const handleTimeClick = (timestamp: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp;
      
      const matchIndex = result.matches.findIndex(
        match => Math.abs(match.timestamp - timestamp) < 0.5
      );
      
      if (matchIndex !== -1) {
        setSelectedMatchIndex(matchIndex);
      }
    }
  };

  const productGroups = React.useMemo(() => {
    const groups: Record<string, ProductResult & { matchCount: number, avgSimilarity: number }> = {};
    
    result.products.forEach(product => {
      groups[product.id] = {
        ...product,
        matchCount: 0,
        avgSimilarity: 0
      };
    });
    
    result.matches.forEach(match => {
      if (groups[match.productId]) {
        groups[match.productId].matchCount += 1;
        groups[match.productId].avgSimilarity += match.similarity;
      }
    });
    
    Object.keys(groups).forEach(key => {
      if (groups[key].matchCount > 0) {
        groups[key].avgSimilarity = groups[key].avgSimilarity / groups[key].matchCount;
      }
    });
    
    return Object.values(groups)
      .sort((a, b) => b.matchCount - a.matchCount); 
  }, [result]);

  const timeline = React.useMemo(() => {
    return result.timeline || [];
  }, [result]);

  return (
    <Box sx={{ mb: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Результаты анализа
            </Typography>
            <Button variant="outlined" onClick={onClose}>
              Закрыть
            </Button>
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Всего совпадений
                  </Typography>
                  <Typography variant="h4">{totalMatches}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Товаров с совпадениями
                  </Typography>
                  <Typography variant="h4">{matchedProducts}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Средний % совпадения
                  </Typography>
                  <Typography variant="h4">{(avgSimilarity * 100).toFixed(1)}%</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          {timeline.length > 0 && videoRef.current && (
            <ResultTimeline
              timeline={timeline}
              threshold={result.threshold || 0.7}
              videoDuration={videoRef.current.duration}
              onTimeClick={handleTimeClick}
            />
          )}
          
          {selectedMatchIndex !== null && (
            <Card variant="outlined" sx={{ mb: 3, bgcolor: 'rgba(66, 165, 245, 0.1)' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Выбранное совпадение
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Время: {new Date(result.matches[selectedMatchIndex].timestamp * 1000).toISOString().substr(11, 8)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Совпадение: {(result.matches[selectedMatchIndex].similarity * 100).toFixed(1)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="textSecondary">
                      Товар: {result.products.find(p => p.id === result.matches[selectedMatchIndex]?.productId)?.name || 'Неизвестный товар'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      ID товара: {result.matches[selectedMatchIndex].productId}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Список товаров и совпадений
          </Typography>
          
          <TableContainer component={Paper} sx={{ mb: 3 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Товар</TableCell>
                  <TableCell>Артикул</TableCell>
                  <TableCell align="right">Кол-во совпадений</TableCell>
                  <TableCell align="right">Средний % совпадения</TableCell>
                  <TableCell>Ссылка на товар</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {productGroups.map((product) => (
                  <TableRow key={product.id} hover={product.matchCount > 0}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        {product.imageUrl && (
                          <Box
                            component="img"
                            src={product.imageUrl}
                            alt={product.name}
                            sx={{ width: 40, height: 40, mr: 2, objectFit: 'contain' }}
                          />
                        )}
                        <Typography variant="body2">{product.name}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{product.id}</TableCell>
                    <TableCell align="right">
                      {product.matchCount > 0 ? (
                        <Chip 
                          label={product.matchCount} 
                          color="primary" 
                          size="small"
                        />
                      ) : (
                        <Typography variant="body2" color="text.secondary">0</Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      {product.matchCount > 0 ? (
                        <Typography variant="body2">
                          {(product.avgSimilarity * 100).toFixed(1)}%
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {product.url ? (
                        <Button 
                          size="small" 
                          variant="outlined" 
                          href={product.url} 
                          target="_blank"
                        >
                          Открыть
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AnalysisResultComponent;
