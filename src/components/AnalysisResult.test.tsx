import React from 'react';
import { render, screen } from '@testing-library/react';
import AnalysisResult from './AnalysisResult';

const mockAnalysis = {
  id: 'test-id-123',
  videoUrl: 'https://example.com/video.mp4',
  status: 'completed' as const,
  createdAt: '2025-04-14T12:00:00Z',
  completedAt: '2025-04-14T12:05:00Z',
  matches: [
    { timestamp: 10000, productId: 'prod1', similarity: 0.85 },
    { timestamp: 15000, productId: 'prod1', similarity: 0.87 },
    { timestamp: 25000, productId: 'prod2', similarity: 0.92 }
  ],
  products: [
    { id: 'prod1', name: 'Продукт 1', imageUrl: 'https://example.com/img1.jpg' },
    { id: 'prod2', name: 'Продукт 2', imageUrl: 'https://example.com/img2.jpg' }
  ],
  timeline: [10000, 15000, 25000],
  threshold: 0.7
};

describe('AnalysisResult', () => {
  test('renders analysis result component correctly', () => {
    render(<AnalysisResult analysis={mockAnalysis} />);
    
    expect(screen.getByText('Результаты анализа')).toBeInTheDocument();
    expect(screen.getByText('Всего совпадений:')).toBeInTheDocument();
    expect(screen.getByText('Продуктов найдено:')).toBeInTheDocument();
    
    expect(screen.getByText('Продукт 1')).toBeInTheDocument();
    expect(screen.getByText('Продукт 2')).toBeInTheDocument();
  });
  
  test('calculates statistics correctly', () => {
    render(<AnalysisResult analysis={mockAnalysis} />);
    
    expect(screen.getByText('Всего совпадений: 3')).toBeInTheDocument();
    expect(screen.getByText('Продуктов найдено: 2')).toBeInTheDocument();
  });
});
