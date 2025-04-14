import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  accept: string;
  maxSize?: number;
  multiple?: boolean;
  onFileSelect: (files: File[]) => void;
  fileType: 'image' | 'video';
  className?: string;
  previewUrl?: string;
  label?: string;
  isUploading?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept,
  maxSize = 100 * 1024 * 1024, // 100MB default
  multiple = false,
  onFileSelect,
  fileType,
  className = '',
  previewUrl,
  label,
  isUploading = false
}) => {
  const [preview, setPreview] = useState<string | null>(previewUrl || null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    // Обработка отклоненных файлов
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        setError(`Файл слишком большой. Максимальный размер: ${Math.round(maxSize / (1024 * 1024))}MB`);
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        setError(`Неподдерживаемый формат файла. Поддерживаемые форматы: ${accept.replace(/\./g, ' ')}`);
      } else {
        setError('Ошибка загрузки файла. Пожалуйста, попробуйте другой файл.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      setError(null);
      onFileSelect(acceptedFiles);
      
      // Создаем превью для первого файла
      if (fileType === 'image' && acceptedFiles[0]) {
        const url = URL.createObjectURL(acceptedFiles[0]);
        setPreview(url);
      } else if (fileType === 'video' && acceptedFiles[0]) {
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src);
        };
        video.src = URL.createObjectURL(acceptedFiles[0]);
        setPreview(URL.createObjectURL(acceptedFiles[0]));
      }
    }
  }, [maxSize, accept, onFileSelect, fileType]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc: Record<string, string[]>, curr) => {
      const key = curr.trim();
      acc[key] = [];
      return acc;
    }, {}),
    maxSize,
    multiple
  });

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-wb-text mb-2">{label}</label>}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors duration-200 
        ${isDragActive ? 'border-wb-purple bg-purple-50' : 'border-gray-300 hover:border-wb-purple'} 
        ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} disabled={isUploading} />
        
        {preview ? (
          <div className="flex flex-col items-center">
            {fileType === 'image' ? (
              <img src={preview} alt="Preview" className="max-h-40 max-w-full object-contain mb-2" />
            ) : (
              <video 
                src={preview} 
                className="max-h-40 max-w-full object-contain mb-2" 
                controls={false}
              />
            )}
            <p className="text-sm text-wb-purple font-medium">
              {isUploading ? 'Загрузка...' : 'Нажмите или перетащите, чтобы заменить'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-2"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H8m36-12h-4m4 0H20"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="text-sm text-gray-600">
              {isUploading ? 'Загрузка...' : (
                <>
                  <span className="text-wb-purple font-medium">Нажмите для загрузки</span> или перетащите
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {fileType === 'image' ? 'JPG, PNG, JPEG до 10MB' : 'MP4, AVI, MOV до 100MB'}
            </p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;