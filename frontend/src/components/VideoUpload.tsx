import React, { useState } from 'react';
import { apiService, UploadResponse } from '../services/api';

interface VideoUploadProps {
  onUploadSuccess: (response: UploadResponse) => void;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const response = await apiService.uploadVideo(file);
      onUploadSuccess(response);
    } catch (err: any) {
      console.error('Upload error:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Upload failed';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Upload Lecture Video</h2>
      
      <div className="file-input-container">
        <input
          type="file"
          accept="video/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="file-input"
        />
        
        {file && (
          <div className="file-info">
            <p>Selected: {file.name}</p>
            <p>Size: {(file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
        )}
      </div>

      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className="upload-button"
      >
        {uploading ? 'Uploading...' : 'Upload Video'}
      </button>

      {error && <div className="error-message">{error}</div>}

      <style jsx>{`
        .upload-container {
          padding: 20px;
          border: 2px dashed #ccc;
          border-radius: 8px;
          text-align: center;
          margin-bottom: 20px;
        }

        .file-input-container {
          margin: 20px 0;
        }

        .file-input {
          margin-bottom: 10px;
        }

        .file-info {
          background: #f5f5f5;
          padding: 10px;
          border-radius: 4px;
          margin: 10px 0;
        }

        .file-info p {
          margin: 5px 0;
          font-size: 14px;
        }

        .upload-button {
          background: #007bff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
        }

        .upload-button:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .upload-button:hover:not(:disabled) {
          background: #0056b3;
        }

        .error-message {
          color: #dc3545;
          margin-top: 10px;
          padding: 10px;
          background: #f8d7da;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default VideoUpload;