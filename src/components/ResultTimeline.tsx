import React, { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { TimelinePoint } from '../services/api';

interface ResultTimelineProps {
  timeline: TimelinePoint[];
  threshold: number;
  videoDuration: number;
  onTimeClick: (timestamp: number) => void;
}

const ResultTimeline: React.FC<ResultTimelineProps> = ({
  timeline,
  threshold,
  videoDuration,
  onTimeClick,
}) => {
  const theme = useTheme();

  const timelineData = useMemo(() => {
    if (!timeline.length || !videoDuration) return [];

    const totalPoints = Math.min(300, timeline.length); 
    const step = timeline.length / totalPoints;
    
    const points: { x: number; y: number; original: TimelinePoint }[] = [];
    
    for (let i = 0; i < totalPoints; i++) {
      const index = Math.floor(i * step);
      const point = timeline[index];
      
      if (point) {
        points.push({
          x: (point.timestamp / videoDuration) * 100, 
          y: point.similarity,
          original: point,
        });
      }
    }
    
    return points;
  }, [timeline, videoDuration]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <Box sx={{ width: '100%', mt: 2, mb: 4 }}>
      <Typography variant="subtitle1" gutterBottom>
        Таймлайн совпадений
      </Typography>
      
      <Box
        sx={{
          position: 'relative',
          height: '100px',
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '1px',
            backgroundColor: theme.palette.error.main,
            bottom: `${threshold * 100}%`,
            zIndex: 2,
          }}
        />

        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{ position: 'absolute' }}
        >
          <polyline
            points={timelineData.map(p => `${p.x},${100 - p.y * 100}`).join(' ')}
            fill="none"
            stroke={theme.palette.primary.main}
            strokeWidth="1"
          />
        </svg>
        
        {timelineData
          .filter(point => point.y >= threshold)
          .map((point, index) => (
            <Box
              key={index}
              sx={{
                position: 'absolute',
                width: '8px',
                height: '8px',
                backgroundColor: theme.palette.error.main,
                borderRadius: '50%',
                left: `calc(${point.x}% - 4px)`,
                bottom: `calc(${point.y * 100}% - 4px)`,
                cursor: 'pointer',
                '&:hover': {
                  width: '12px',
                  height: '12px',
                  left: `calc(${point.x}% - 6px)`,
                  bottom: `calc(${point.y * 100}% - 6px)`,
                  zIndex: 10,
                },
                zIndex: 5,
              }}
              onClick={() => onTimeClick(point.original.timestamp)}
              title={`Время: ${formatTime(point.original.timestamp)}, Совпадение: ${Math.round(point.original.similarity * 100)}%`}
            />
          ))}
       
        {[0, 25, 50, 75, 100].map(percent => (
          <Typography
            key={percent}
            variant="caption"
            sx={{
              position: 'absolute',
              bottom: -20,
              left: `${percent}%`,
              transform: 'translateX(-50%)',
              color: theme.palette.text.secondary,
            }}
          >
            {formatTime((percent / 100) * videoDuration)}
          </Typography>
        ))}
      </Box>
    </Box>
  );
};

export default ResultTimeline;
