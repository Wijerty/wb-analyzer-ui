import React, { useState } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  Typography, 
  Grid, 
  Chip,
  CircularProgress,
  InputAdornment,
  IconButton,
  Autocomplete,
  Box
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import apiService, { ProductResult } from '../services/api';

interface NewAnalysisFormProps {
  onAnalysisCreated: (analysisId: string) => void;
}

const NewAnalysisForm: React.FC<NewAnalysisFormProps> = ({ onAnalysisCreated }) => {
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProductResult[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<ProductResult[]>([]);
  const [threshold, setThreshold] = useState<number>(0.7);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setError('');
      const products = await apiService.searchProducts(searchQuery);
      setSearchResults(products);
    } catch (err) {
      setError('Ошибка при поиске товаров');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductSelect = (product: ProductResult | null) => {
    if (product && !selectedProducts.some(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, product]);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setVideoFile(file);
      setVideoUrl(''); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedProducts.length === 0) {
      setError('Выберите хотя бы один товар для анализа');
      return;
    }

    if (!videoFile && !videoUrl) {
      setError('Загрузите видео или укажите URL');
      return;
    }

    const productIds = selectedProducts.map(p => p.id);
    
    try {
      setIsLoading(true);
      setError('');
      
      let analysisResult;
      
      if (videoFile) {
        analysisResult = await apiService.uploadVideoAndAnalyze(videoFile, productIds, threshold);
      } else {
        analysisResult = await apiService.createAnalysis({
          videoUrl,
          productIds,
          threshold
        });
      }
      
      onAnalysisCreated(analysisResult.id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка при создании анализа');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card elevation={3}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Новый анализ видео
        </Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Видео для анализа
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="URL видео"
                    variant="outlined"
                    value={videoUrl}
                    onChange={(e) => {
                      setVideoUrl(e.target.value);
                      setVideoFile(null);
                    }}
                    disabled={!!videoFile || isLoading}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    или загрузите файл
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<UploadFileIcon />}
                    disabled={!!videoUrl || isLoading}
                  >
                    {videoFile ? videoFile.name : 'Выбрать видео'}
                    <input
                      type="file"
                      accept="video/*"
                      hidden
                      onChange={handleFileChange}
                    />
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Товары для поиска
              </Typography>
              
              <Autocomplete
                fullWidth
                options={searchResults}
                loading={isSearching}
                getOptionLabel={(option) => `${option.name} (ID: ${option.id})`}
                filterOptions={(x) => x} 
                onChange={(_, value) => handleProductSelect(value)}
                value={null}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Поиск товаров"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isSearching ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                          <InputAdornment position="end">
                            <IconButton onClick={handleSearch} disabled={isSearching}>
                              <SearchIcon />
                            </IconButton>
                          </InputAdornment>
                        </>
                      ),
                    }}
                  />
                )}
              />
              
              <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedProducts.map((product) => (
                  <Chip
                    key={product.id}
                    label={`${product.name} (ID: ${product.id})`}
                    onDelete={() => handleRemoveProduct(product.id)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Настройки анализа
              </Typography>
              
              <TextField
                type="number"
                label="Порог сходства"
                variant="outlined"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                inputProps={{
                  min: 0.1,
                  max: 1.0,
                  step: 0.05
                }}
                fullWidth
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Значение от 0.1 до 1.0. Чем выше значение, тем строже критерий сходства.
              </Typography>
            </Grid>
            
            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {isLoading ? 'Обработка...' : 'Создать анализ'}
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewAnalysisForm;
